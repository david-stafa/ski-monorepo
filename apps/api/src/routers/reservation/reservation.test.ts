import { describe, expect, it } from 'vitest'
import {
	caller,
	createTestReservation,
	createTestSki,
	createTestSkiBoot,
	createTestSnowboard,
} from '../../../test/helpers'
import type { PersonEquipment } from '../../schemas/reservation'

/** Is the ski free to book for these dates, per the picker's own query? */
const isSkiAvailable = async (equipmentItemId: string, startDate: string, endDate: string) => {
	const available = await caller.equipment.equipmentItem.findAvailable({
		type: 'SKI',
		startDate: new Date(startDate),
		endDate: new Date(endDate),
	})
	return available.some((item) => item.id === equipmentItemId)
}

describe('reservation', () => {
	it('starts out Booked', async () => {
		const skiId = await createTestSki()

		const id = await createTestReservation([{ SKI: skiId }])
		const reservation = await caller.reservation.get({ id })

		expect(reservation.status).toBe('BOOKED')
		expect(reservation.people).toHaveLength(1)
		expect(reservation.people[0]?.reservationItems[0]?.equipmentItemId).toBe(skiId)
	})

	it('books its people and their items too', async () => {
		const skiId = await createTestSki()

		const id = await createTestReservation([{ SKI: skiId }, {}])
		const reservation = await caller.reservation.get({ id })

		expect(reservation.people.map((person) => person.status)).toEqual(['BOOKED', 'BOOKED'])
		expect(reservation.people[0]?.reservationItems.map((item) => item.status)).toEqual(['BOOKED'])
	})
})

describe('availability', () => {
	// createTestReservation books 2027-01-10 → 2027-01-15
	it('a Booked item blocks overlapping dates', async () => {
		const skiId = await createTestSki()
		await createTestReservation([{ SKI: skiId }])

		expect(await isSkiAvailable(skiId, '2027-01-14', '2027-01-20')).toBe(false)
	})

	it('a Booked item leaves the dates after it free', async () => {
		const skiId = await createTestSki()
		await createTestReservation([{ SKI: skiId }])

		expect(await isSkiAvailable(skiId, '2027-01-15', '2027-01-20')).toBe(true)
	})

	it("a cancelled reservation's item is free again", async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }])

		await caller.reservation.cancel({ id })

		expect(await isSkiAvailable(skiId, '2027-01-10', '2027-01-15')).toBe(true)
	})
})

describe('cancel', () => {
	it('cancelling again keeps the date it was first cancelled on', async () => {
		const id = await createTestReservation([{}])

		const first = await caller.reservation.cancel({ id })
		const again = await caller.reservation.cancel({ id })

		expect(first.cancelledAt).not.toBeNull()
		expect(again.cancelledAt).toEqual(first.cancelledAt)
	})

	it('cancelling a person again keeps the date they were first cancelled on', async () => {
		const id = await createTestReservation([{}])
		const reservation = await caller.reservation.get({ id })
		const personId = reservation.people[0]?.id ?? ''

		const first = await caller.person.cancel({ id: personId })
		const again = await caller.person.cancel({ id: personId })

		expect(first.cancelledAt).not.toBeNull()
		expect(again.cancelledAt).toEqual(first.cancelledAt)
	})
})

describe('advance', () => {
	/** Every item of the reservation: its status and timestamps, keyed by the
	 * equipment it books. Rows come back in no set order, hence the keys. */
	const itemsByEquipment = async (id: string) => {
		const reservation = await caller.reservation.get({ id })
		const items = reservation.people.flatMap((person) => person.reservationItems)
		return Object.fromEntries(items.map((item) => [item.equipmentItemId, item]))
	}

	const statusesByEquipment = async (id: string) => {
		const items = await itemsByEquipment(id)
		return Object.fromEntries(Object.entries(items).map(([key, item]) => [key, item.status]))
	}

	/**
	 * A family of three: Dad with a ski and ski boots, a child with a snowboard,
	 * and Mum with a ski, who was cancelled. The child has already picked up and
	 * Dad's ski is prepared, so the family starts out Booked only because of
	 * Dad's boots.
	 */
	const createMixedFamily = async () => {
		const gear = {
			dadSki: await createTestSki(),
			dadBoots: await createTestSkiBoot(),
			childBoard: await createTestSnowboard(),
			mumSki: await createTestSki(),
		}
		const id = await createTestReservation([
			{ SKI: gear.dadSki, SKI_BOOT: gear.dadBoots },
			{ SNOWBOARD: gear.childBoard },
			{ SKI: gear.mumSki },
		])
		const items = await itemsByEquipment(id)
		const itemId = (equipmentItemId: string) => items[equipmentItemId]?.id ?? ''
		const mum = (await caller.reservation.get({ id })).people.find(
			(person) => person.name === 'Person 3'
		)
		if (!mum) throw new Error('Mum is missing')

		await caller.person.cancel({ id: mum.id })
		await caller.reservationItem.advance({ id: itemId(gear.childBoard), from: 'BOOKED' })
		await caller.reservationItem.advance({ id: itemId(gear.childBoard), from: 'PREPARED' })
		await caller.reservationItem.advance({ id: itemId(gear.dadSki), from: 'BOOKED' })
		return { id, gear }
	}

	it('steps a mixed family through to Returned, never moving items that are ahead', async () => {
		const { id, gear } = await createMixedFamily()
		expect(await statusesByEquipment(id)).toEqual({
			[gear.dadSki]: 'PREPARED',
			[gear.dadBoots]: 'BOOKED',
			[gear.childBoard]: 'PICKED_UP',
			[gear.mumSki]: 'CANCELLED',
		})

		const prepared = await caller.reservation.advance({ id, from: 'BOOKED' })
		expect(prepared.status).toBe('PREPARED')
		expect(await statusesByEquipment(id)).toEqual({
			[gear.dadSki]: 'PREPARED',
			[gear.dadBoots]: 'PREPARED',
			[gear.childBoard]: 'PICKED_UP',
			[gear.mumSki]: 'CANCELLED',
		})

		const pickedUp = await caller.reservation.advance({ id, from: 'PREPARED' })
		expect(pickedUp.status).toBe('PICKED_UP')
		expect(await statusesByEquipment(id)).toEqual({
			[gear.dadSki]: 'PICKED_UP',
			[gear.dadBoots]: 'PICKED_UP',
			[gear.childBoard]: 'PICKED_UP',
			[gear.mumSki]: 'CANCELLED',
		})

		const returned = await caller.reservation.advance({ id, from: 'PICKED_UP' })
		expect(returned.status).toBe('RETURNED')
		expect(await statusesByEquipment(id)).toEqual({
			[gear.dadSki]: 'RETURNED',
			[gear.dadBoots]: 'RETURNED',
			[gear.childBoard]: 'RETURNED',
			[gear.mumSki]: 'CANCELLED',
		})

		// each person rolled up with them; the cancelled one stays cancelled
		const reservation = await caller.reservation.get({ id })
		const people = Object.fromEntries(
			reservation.people.map((person) => [person.name, person.status])
		)
		expect(people).toEqual({
			'Person 1': 'RETURNED',
			'Person 2': 'RETURNED',
			'Person 3': 'CANCELLED',
		})
	})

	it('sets the timestamp on the moved items only', async () => {
		const { id, gear } = await createMixedFamily()
		const before = await itemsByEquipment(id)

		await caller.reservation.advance({ id, from: 'BOOKED' })

		const after = await itemsByEquipment(id)
		// only Dad's boots moved
		expect(after[gear.dadBoots]?.preparedAt).not.toBeNull()
		expect(after[gear.dadBoots]?.pickedUpAt).toBeNull()
		expect(after[gear.dadSki]?.preparedAt).toEqual(before[gear.dadSki]?.preparedAt)
		expect(after[gear.dadSki]?.pickedUpAt).toBeNull()
		expect(after[gear.childBoard]?.preparedAt).toEqual(before[gear.childBoard]?.preparedAt)
		expect(after[gear.childBoard]?.pickedUpAt).toEqual(before[gear.childBoard]?.pickedUpAt)
		expect(after[gear.childBoard]?.returnedAt).toBeNull()
		expect(after[gear.mumSki]?.preparedAt).toBeNull()
	})
	it('is refused with nothing left to do, and for a missing reservation', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }])
		await caller.reservation.advance({ id, from: 'BOOKED' })
		await caller.reservation.advance({ id, from: 'PREPARED' })
		await caller.reservation.advance({ id, from: 'PICKED_UP' })

		await expect(caller.reservation.advance({ id, from: 'RETURNED' })).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Vrácenou ani zrušenou rezervaci nelze posunout dál',
		})
		await expect(
			caller.reservation.advance({ id: 'missing', from: 'BOOKED' })
		).rejects.toMatchObject({ code: 'NOT_FOUND' })
	})

	it('a Cancelled reservation cannot advance', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }])
		await caller.reservation.cancel({ id })

		await expect(caller.reservation.advance({ id, from: 'CANCELLED' })).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Vrácenou ani zrušenou rezervaci nelze posunout dál',
		})
	})

	it('a second click from an outdated page changes nothing', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }])
		await caller.reservation.advance({ id, from: 'BOOKED' })

		await expect(caller.reservation.advance({ id, from: 'BOOKED' })).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Rezervaci mezitím změnil někdo jiný. Obnovte stránku a zkuste to znovu.',
		})
		expect(await statusesByEquipment(id)).toEqual({ [skiId]: 'PREPARED' })
	})

	it('works after a person is cancelled, rolling the reservation up first', async () => {
		const firstSkiId = await createTestSki()
		const secondSkiId = await createTestSki()
		const id = await createTestReservation([{ SKI: firstSkiId }, { SKI: secondSkiId }])
		const [first, second] = (await caller.reservation.get({ id })).people.sort((a, b) =>
			a.name.localeCompare(b.name)
		)
		if (!first || !second) throw new Error('the family is incomplete')
		const firstItem = first.reservationItems[0]?.id ?? ''
		await caller.reservationItem.advance({ id: firstItem, from: 'BOOKED' })
		await caller.reservationItem.advance({ id: firstItem, from: 'PREPARED' })

		// only the second person held the reservation back at Booked
		await caller.person.cancel({ id: second.id })
		expect((await caller.reservation.get({ id })).status).toBe('PICKED_UP')

		const returned = await caller.reservation.advance({ id, from: 'PICKED_UP' })
		expect(returned.status).toBe('RETURNED')
	})

	it('moves a family with an accessories-only person, one step at a time', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }, {}])
		const statusesByPerson = async () => {
			const reservation = await caller.reservation.get({ id })
			return Object.fromEntries(reservation.people.map((person) => [person.name, person.status]))
		}
		const people = (await caller.reservation.get({ id })).people
		const skier = people.find((person) => person.name === 'Person 1')
		const goggles = people.find((person) => person.name === 'Person 2')
		if (!skier || !goggles) throw new Error('the family is incomplete')

		// the skier goes ahead on their own; the goggles person holds the family back
		await caller.person.advance({ id: skier.id, from: 'BOOKED' })
		expect(await statusesByPerson()).toEqual({ 'Person 1': 'PREPARED', 'Person 2': 'BOOKED' })
		expect((await caller.reservation.get({ id })).status).toBe('BOOKED')

		// only the goggles person is at Booked, so only they move
		expect((await caller.reservation.advance({ id, from: 'BOOKED' })).status).toBe('PREPARED')
		expect(await statusesByPerson()).toEqual({ 'Person 1': 'PREPARED', 'Person 2': 'PREPARED' })
		expect(await statusesByEquipment(id)).toEqual({ [skiId]: 'PREPARED' })

		// both are at Prepared now, so both move
		expect((await caller.reservation.advance({ id, from: 'PREPARED' })).status).toBe('PICKED_UP')
		expect(await statusesByPerson()).toEqual({ 'Person 1': 'PICKED_UP', 'Person 2': 'PICKED_UP' })
		expect(await statusesByEquipment(id)).toEqual({ [skiId]: 'PICKED_UP' })

		expect((await caller.reservation.advance({ id, from: 'PICKED_UP' })).status).toBe('RETURNED')
		expect(await statusesByPerson()).toEqual({ 'Person 1': 'RETURNED', 'Person 2': 'RETURNED' })
	})

	it('moves a reservation where nobody has gear', async () => {
		const id = await createTestReservation([{}, {}])

		expect((await caller.reservation.advance({ id, from: 'BOOKED' })).status).toBe('PREPARED')
		const reservation = await caller.reservation.get({ id })
		expect(reservation.people.map((person) => person.status)).toEqual(['PREPARED', 'PREPARED'])
	})
})

describe('update rolls the statuses up', () => {
	/** The edit form's payload for this reservation, with one person's
	 * equipment changed. */
	const editEquipment = async (id: string, equipment: Partial<PersonEquipment>) => {
		const form = await caller.reservation.getForEdit({ id })
		await caller.reservation.update({
			...form,
			people: form.people.map((person) => ({
				...person,
				equipment: { ...person.equipment, ...equipment },
			})),
		})
	}

	it('dropping the only Booked item moves the person and reservation on', async () => {
		const skiId = await createTestSki()
		const bootId = await createTestSkiBoot()
		const id = await createTestReservation([{ SKI: skiId, SKI_BOOT: bootId }])
		const [person] = (await caller.reservation.get({ id })).people
		const ski = person?.reservationItems.find((item) => item.equipmentItemId === skiId)
		await caller.reservationItem.advance({ id: ski?.id ?? '', from: 'BOOKED' })

		await editEquipment(id, { SKI_BOOT: null })

		const reservation = await caller.reservation.get({ id })
		expect(reservation.people[0]?.status).toBe('PREPARED')
		expect(reservation.status).toBe('PREPARED')
		// and the one-click step now works from there
		expect((await caller.person.advance({ id: person?.id ?? '', from: 'PREPARED' })).status).toBe(
			'PICKED_UP'
		)
	})

	it('adding gear to a Prepared person moves them back to Booked', async () => {
		const skiId = await createTestSki()
		const bootId = await createTestSkiBoot()
		const id = await createTestReservation([{ SKI: skiId }])
		const [person] = (await caller.reservation.get({ id })).people
		await caller.person.advance({ id: person?.id ?? '', from: 'BOOKED' })

		await editEquipment(id, { SKI_BOOT: bootId })

		const reservation = await caller.reservation.get({ id })
		expect(reservation.people[0]?.status).toBe('BOOKED')
		expect(reservation.status).toBe('BOOKED')
	})

	it('a person who loses all their gear keeps their status, and is moved by hand', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }])
		const [person] = (await caller.reservation.get({ id })).people
		const personId = person?.id ?? ''
		await caller.person.advance({ id: personId, from: 'BOOKED' })

		await editEquipment(id, { SKI: null })

		let reservation = await caller.reservation.get({ id })
		expect(reservation.people[0]?.status).toBe('PREPARED')
		expect(reservation.status).toBe('PREPARED')

		// from here on the person itself moves, and can be undone
		expect((await caller.person.advance({ id: personId, from: 'PREPARED' })).status).toBe(
			'PICKED_UP'
		)
		expect((await caller.person.undo({ id: personId, from: 'PICKED_UP' })).status).toBe('PREPARED')
		reservation = await caller.reservation.get({ id })
		expect(reservation.status).toBe('PREPARED')
	})

	it('a Prepared accessories-only person who gets gear added drops back to Booked', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{}])
		const [person] = (await caller.reservation.get({ id })).people
		await caller.person.advance({ id: person?.id ?? '', from: 'BOOKED' })
		expect((await caller.reservation.get({ id })).status).toBe('PREPARED')

		await editEquipment(id, { SKI: skiId })

		const reservation = await caller.reservation.get({ id })
		expect(reservation.people[0]?.status).toBe('BOOKED')
		expect(reservation.status).toBe('BOOKED')
	})
})
