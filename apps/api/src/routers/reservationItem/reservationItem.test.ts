import { describe, expect, it } from 'vitest'
import { caller, createTestReservation, createTestSki } from '../../../test/helpers'

const createSkiBoot = async () => {
	const boot = await caller.equipment.skiBoot.create({
		brand: 'Salomon',
		model: 'S/Pro',
		length: 27.5,
		color: null,
		isKids: false,
		gender: null,
	})
	return boot.equipmentItem.id
}

const createSnowboard = async () => {
	const board = await caller.equipment.snowboard.create({
		brand: 'Burton',
		model: 'Custom',
		length: 156,
		gender: null,
	})
	return board.equipmentItem.id
}

/** The reservation item that books this piece of equipment. */
const findItem = async (reservationId: string, equipmentItemId: string) => {
	const reservation = await caller.reservation.get({ id: reservationId })
	const items = reservation.people.flatMap((person) => person.reservationItems)
	const item = items.find((item) => item.equipmentItemId === equipmentItemId)
	if (!item) throw new Error(`no reservation item books ${equipmentItemId}`)
	return item
}

/** Advances an item from Booked until it reaches `status`. */
const advanceTo = async (id: string, status: 'PREPARED' | 'PICKED_UP' | 'RETURNED') => {
	await caller.reservationItem.advance({ id, from: 'BOOKED' })
	if (status === 'PREPARED') return
	await caller.reservationItem.advance({ id, from: 'PREPARED' })
	if (status === 'PICKED_UP') return
	await caller.reservationItem.advance({ id, from: 'PICKED_UP' })
}

/** A reservation with one person holding one ski. Returns the reservation
 * item's id. */
const createTestItem = async () => {
	const skiId = await createTestSki()
	const reservationId = await createTestReservation([{ SKI: skiId }])
	return (await findItem(reservationId, skiId)).id
}

describe('reservationItem.advance / undo', () => {
	it('moves one step at a time through the whole path and back', async () => {
		const id = await createTestItem()

		const prepared = await caller.reservationItem.advance({ id, from: 'BOOKED' })
		expect(prepared.status).toBe('PREPARED')
		expect(prepared.preparedAt).not.toBeNull()

		const pickedUp = await caller.reservationItem.advance({ id, from: 'PREPARED' })
		expect(pickedUp.status).toBe('PICKED_UP')
		expect(pickedUp.pickedUpAt).not.toBeNull()

		const returned = await caller.reservationItem.advance({ id, from: 'PICKED_UP' })
		expect(returned.status).toBe('RETURNED')
		expect(returned.returnedAt).not.toBeNull()

		const undoneReturn = await caller.reservationItem.undo({ id, from: 'RETURNED' })
		expect(undoneReturn.status).toBe('PICKED_UP')
		expect(undoneReturn.returnedAt).toBeNull()
		expect(undoneReturn.pickedUpAt).not.toBeNull()

		const undonePickUp = await caller.reservationItem.undo({ id, from: 'PICKED_UP' })
		expect(undonePickUp.status).toBe('PREPARED')
		expect(undonePickUp.pickedUpAt).toBeNull()

		const undonePrep = await caller.reservationItem.undo({ id, from: 'PREPARED' })
		expect(undonePrep.status).toBe('BOOKED')
		expect(undonePrep.preparedAt).toBeNull()
	})
})

describe('rolled-up status', () => {
	it('a person is at the least advanced status among their items', async () => {
		const skiId = await createTestSki()
		const bootId = await createSkiBoot()
		const boardId = await createSnowboard()
		const reservationId = await createTestReservation([
			{ SKI: skiId, SKI_BOOT: bootId, SNOWBOARD: boardId },
		])

		await advanceTo((await findItem(reservationId, skiId)).id, 'PICKED_UP')
		await advanceTo((await findItem(reservationId, bootId)).id, 'PICKED_UP')
		await advanceTo((await findItem(reservationId, boardId)).id, 'PREPARED')

		const reservation = await caller.reservation.get({ id: reservationId })
		expect(reservation.people[0]?.status).toBe('PREPARED')
	})

	it('a reservation is at the least advanced status among its people', async () => {
		const firstSkiId = await createTestSki()
		const secondSkiId = await createTestSki()
		const reservationId = await createTestReservation([{ SKI: firstSkiId }, { SKI: secondSkiId }])

		await advanceTo((await findItem(reservationId, firstSkiId)).id, 'RETURNED')
		await advanceTo((await findItem(reservationId, secondSkiId)).id, 'PICKED_UP')

		const reservation = await caller.reservation.get({ id: reservationId })
		expect(reservation.people.map((person) => person.status)).toEqual(['RETURNED', 'PICKED_UP'])
		expect(reservation.status).toBe('PICKED_UP')
	})

	it('undo rolls the person and the reservation back too', async () => {
		const skiId = await createTestSki()
		const reservationId = await createTestReservation([{ SKI: skiId }])
		const { id } = await findItem(reservationId, skiId)

		await advanceTo(id, 'PREPARED')
		await caller.reservationItem.undo({ id, from: 'PREPARED' })

		const reservation = await caller.reservation.get({ id: reservationId })
		expect(reservation.people[0]?.status).toBe('BOOKED')
		expect(reservation.status).toBe('BOOKED')
	})
})

describe('availability', () => {
	/** Is the ski free to book for these dates, per the picker's own query? */
	const isSkiAvailable = async (equipmentItemId: string) => {
		// createTestReservation books 2027-01-10 → 2027-01-15; ask for its middle
		const available = await caller.equipment.equipmentItem.findAvailable({
			type: 'SKI',
			startDate: new Date('2027-01-12'),
			endDate: new Date('2027-01-13'),
		})
		return available.some((item) => item.id === equipmentItemId)
	}

	it('a Picked up item still blocks its equipment', async () => {
		const skiId = await createTestSki()
		const reservationId = await createTestReservation([{ SKI: skiId }])

		await advanceTo((await findItem(reservationId, skiId)).id, 'PICKED_UP')

		expect(await isSkiAvailable(skiId)).toBe(false)
	})

	it('a Returned item frees its equipment before the end date', async () => {
		const skiId = await createTestSki()
		const reservationId = await createTestReservation([{ SKI: skiId }])

		await advanceTo((await findItem(reservationId, skiId)).id, 'RETURNED')

		expect(await isSkiAvailable(skiId)).toBe(true)
	})
})

describe('refused steps', () => {
	it('a Returned item cannot go further', async () => {
		const id = await createTestItem()
		await advanceTo(id, 'RETURNED')

		await expect(caller.reservationItem.advance({ id, from: 'RETURNED' })).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Vrácenou ani zrušenou položku nelze posunout dál',
		})
	})

	it('a Booked item has nothing to undo', async () => {
		const id = await createTestItem()

		await expect(caller.reservationItem.undo({ id, from: 'BOOKED' })).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'U rezervované ani zrušené položky není co vracet zpět',
		})
	})

	it('a Cancelled item can neither advance nor undo', async () => {
		const skiId = await createTestSki()
		const reservationId = await createTestReservation([{ SKI: skiId }])
		await caller.reservation.cancel({ id: reservationId })
		const { id } = await findItem(reservationId, skiId)

		await expect(caller.reservationItem.advance({ id, from: 'CANCELLED' })).rejects.toMatchObject({
			code: 'CONFLICT',
		})
		await expect(caller.reservationItem.undo({ id, from: 'CANCELLED' })).rejects.toMatchObject({
			code: 'CONFLICT',
		})
		expect((await findItem(reservationId, skiId)).status).toBe('CANCELLED')
	})

	it('a missing item is not found', async () => {
		await expect(
			caller.reservationItem.advance({ id: 'missing', from: 'BOOKED' })
		).rejects.toMatchObject({ code: 'NOT_FOUND' })
	})
})

describe('stale and racing steps', () => {
	it('a step from a status the item has already left changes nothing', async () => {
		const skiId = await createTestSki()
		const reservationId = await createTestReservation([{ SKI: skiId }])
		const { id } = await findItem(reservationId, skiId)
		await caller.reservationItem.advance({ id, from: 'BOOKED' })

		// a second click from the same, now outdated, page
		await expect(caller.reservationItem.advance({ id, from: 'BOOKED' })).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Položku mezitím změnil někdo jiný. Obnovte stránku a zkuste to znovu.',
		})
		expect((await findItem(reservationId, skiId)).status).toBe('PREPARED')
	})

	it('two staff clicking at once move the item only one step', async () => {
		const skiId = await createTestSki()
		const reservationId = await createTestReservation([{ SKI: skiId }])
		const { id } = await findItem(reservationId, skiId)

		const results = await Promise.allSettled([
			caller.reservationItem.advance({ id, from: 'BOOKED' }),
			caller.reservationItem.advance({ id, from: 'BOOKED' }),
		])

		expect(results.map((result) => result.status).sort()).toEqual(['fulfilled', 'rejected'])
		expect((await findItem(reservationId, skiId)).status).toBe('PREPARED')
	})

	it('two staff preparing different items of one person at once still roll the person up', async () => {
		const skiId = await createTestSki()
		const bootId = await createSkiBoot()
		const reservationId = await createTestReservation([{ SKI: skiId, SKI_BOOT: bootId }])
		const ski = await findItem(reservationId, skiId)
		const boot = await findItem(reservationId, bootId)

		await Promise.all([
			caller.reservationItem.advance({ id: ski.id, from: 'BOOKED' }),
			caller.reservationItem.advance({ id: boot.id, from: 'BOOKED' }),
		])

		const reservation = await caller.reservation.get({ id: reservationId })
		expect(reservation.people[0]?.status).toBe('PREPARED')
		expect(reservation.status).toBe('PREPARED')
	})
})
