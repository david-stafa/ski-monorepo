import { describe, expect, it } from 'vitest'
import {
	caller,
	createTestReservation,
	createTestSki,
	createTestSkiBoot,
	createTestSnowboard,
} from '../../../test/helpers'

/** The reservation's only person, with their items keyed by the equipment
 * they book. */
const getPerson = async (reservationId: string) => {
	const reservation = await caller.reservation.get({ id: reservationId })
	const person = reservation.people[0]
	if (!person) throw new Error(`reservation ${reservationId} has no people`)
	const itemFor = (equipmentItemId: string) => {
		const item = person.reservationItems.find((item) => item.equipmentItemId === equipmentItemId)
		if (!item) throw new Error(`no reservation item books ${equipmentItemId}`)
		return item
	}
	return { ...person, itemFor }
}

/** One person holding a ski, ski boots and a snowboard. */
const createMixedPerson = async () => {
	const skiId = await createTestSki()
	const bootId = await createTestSkiBoot()
	const boardId = await createTestSnowboard()
	const reservationId = await createTestReservation([
		{ SKI: skiId, SKI_BOOT: bootId, SNOWBOARD: boardId },
	])
	return { reservationId, skiId, bootId, boardId }
}

describe('person.advance', () => {
	it('steps a mixed person through to Returned, never moving items that are ahead', async () => {
		const { reservationId, skiId, bootId, boardId } = await createMixedPerson()
		// ski and boots already picked up on their own; the snowboard is still Booked
		for (const equipmentItemId of [skiId, bootId]) {
			const { id } = (await getPerson(reservationId)).itemFor(equipmentItemId)
			await caller.reservationItem.advance({ id, from: 'BOOKED' })
			await caller.reservationItem.advance({ id, from: 'PREPARED' })
		}
		const { id } = await getPerson(reservationId)

		const prepared = await caller.person.advance({ id, from: 'BOOKED' })
		expect(prepared.status).toBe('PREPARED')
		let person = await getPerson(reservationId)
		expect(person.itemFor(skiId).status).toBe('PICKED_UP')
		expect(person.itemFor(bootId).status).toBe('PICKED_UP')
		expect(person.itemFor(boardId).status).toBe('PREPARED')

		const pickedUp = await caller.person.advance({ id, from: 'PREPARED' })
		expect(pickedUp.status).toBe('PICKED_UP')
		person = await getPerson(reservationId)
		expect(person.reservationItems.map((item) => item.status)).toEqual([
			'PICKED_UP',
			'PICKED_UP',
			'PICKED_UP',
		])

		const returned = await caller.person.advance({ id, from: 'PICKED_UP' })
		expect(returned.status).toBe('RETURNED')
		person = await getPerson(reservationId)
		expect(person.reservationItems.map((item) => item.status)).toEqual([
			'RETURNED',
			'RETURNED',
			'RETURNED',
		])

		// the reservation rolled up with them
		const reservation = await caller.reservation.get({ id: reservationId })
		expect(reservation.status).toBe('RETURNED')
	})

	it('sets the timestamp on the moved items only', async () => {
		const { reservationId, skiId, bootId } = await createMixedPerson()
		const ski = (await getPerson(reservationId)).itemFor(skiId)
		const preparedSki = await caller.reservationItem.advance({ id: ski.id, from: 'BOOKED' })
		const { id } = await getPerson(reservationId)

		await caller.person.advance({ id, from: 'BOOKED' })

		const person = await getPerson(reservationId)
		// the ski was already Prepared: its time stays the one it was prepared at
		expect(person.itemFor(skiId).preparedAt).toEqual(preparedSki.preparedAt)
		expect(person.itemFor(skiId).pickedUpAt).toBeNull()
		expect(person.itemFor(bootId).preparedAt).not.toBeNull()
		expect(person.itemFor(bootId).pickedUpAt).toBeNull()
	})

	it('is refused with nothing left to do, and for a missing person', async () => {
		const { reservationId } = await createMixedPerson()
		const { id } = await getPerson(reservationId)
		await caller.person.advance({ id, from: 'BOOKED' })
		await caller.person.advance({ id, from: 'PREPARED' })
		await caller.person.advance({ id, from: 'PICKED_UP' })

		await expect(caller.person.advance({ id, from: 'RETURNED' })).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Vrácenou ani zrušenou osobu nelze posunout dál',
		})
		await expect(caller.person.advance({ id: 'missing', from: 'BOOKED' })).rejects.toMatchObject({
			code: 'NOT_FOUND',
		})
	})

	it('a Cancelled person cannot advance', async () => {
		const { reservationId } = await createMixedPerson()
		const { id } = await getPerson(reservationId)
		await caller.person.cancel({ id })

		await expect(caller.person.advance({ id, from: 'CANCELLED' })).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Vrácenou ani zrušenou osobu nelze posunout dál',
		})
	})

	it('a step from a status the person has already left changes nothing', async () => {
		const { reservationId } = await createMixedPerson()
		const { id } = await getPerson(reservationId)
		await caller.person.advance({ id, from: 'BOOKED' })

		// a second click from the same, now outdated, page
		await expect(caller.person.advance({ id, from: 'BOOKED' })).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Osobu mezitím změnil někdo jiný. Obnovte stránku a zkuste to znovu.',
		})
		const person = await getPerson(reservationId)
		expect(person.status).toBe('PREPARED')
		expect(person.reservationItems.every((item) => item.status === 'PREPARED')).toBe(true)
	})

	it('a step from a status the person has fallen back from moves nothing', async () => {
		const { reservationId, skiId } = await createMixedPerson()
		const { id } = await getPerson(reservationId)
		await caller.person.advance({ id, from: 'BOOKED' })
		// someone undoes the ski while the page still shows the person Prepared
		const ski = (await getPerson(reservationId)).itemFor(skiId)
		await caller.reservationItem.undo({ id: ski.id, from: 'PREPARED' })

		await expect(caller.person.advance({ id, from: 'PREPARED' })).rejects.toMatchObject({
			code: 'CONFLICT',
		})
		const person = await getPerson(reservationId)
		expect(person.reservationItems.some((item) => item.status === 'PICKED_UP')).toBe(false)
	})

	it('two staff clicking at once move the person only one step', async () => {
		const { reservationId } = await createMixedPerson()
		const { id } = await getPerson(reservationId)

		const results = await Promise.allSettled([
			caller.person.advance({ id, from: 'BOOKED' }),
			caller.person.advance({ id, from: 'BOOKED' }),
		])

		expect(results.map((result) => result.status).sort()).toEqual(['fulfilled', 'rejected'])
		const person = await getPerson(reservationId)
		expect(person.status).toBe('PREPARED')
		expect(person.reservationItems.every((item) => item.status === 'PREPARED')).toBe(true)
	})
})
