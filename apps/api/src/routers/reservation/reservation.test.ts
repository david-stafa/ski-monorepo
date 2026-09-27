import { describe, expect, it } from 'vitest'
import {
	caller,
	createTestReservation,
	createTestSki,
	createTestSkiBoot,
	createTestSnowboard,
} from '../../../test/helpers'
import type { GetReservationsInput, PersonEquipment } from '../../schemas/reservation'

/** Is the ski free to book for these dates, per the picker's own query? */
const isSkiAvailable = async (equipmentItemId: string, startDate: string, endDate: string) => {
	const available = await caller.equipment.equipmentItem.findAvailable({
		type: 'SKI',
		startDate: new Date(startDate),
		endDate: new Date(endDate),
	})
	return available.some((item) => item.id === equipmentItemId)
}

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

/** Saves the edit form for this reservation, with every person's equipment
 * changed as given (a one-person reservation, unless the change fits all). */
const editEquipment = async (id: string, equipment: Partial<PersonEquipment>) => {
	const form = await caller.reservation.getForEdit({ id })
	return await caller.reservation.update({
		...form,
		people: form.people.map((person) => ({
			...person,
			equipment: { ...person.equipment, ...equipment },
		})),
	})
}

/** Steps one reservation item forward until it reaches `to`. */
const advanceItemTo = async (
	id: string,
	equipmentItemId: string,
	to: 'PREPARED' | 'PICKED_UP' | 'RETURNED'
) => {
	const reservation = await caller.reservation.get({ id })
	const item = reservation.people
		.flatMap((person) => person.reservationItems)
		.find((item) => item.equipmentItemId === equipmentItemId)
	if (!item) throw new Error(`no reservation item books ${equipmentItemId}`)
	const steps = ['BOOKED', 'PREPARED', 'PICKED_UP', 'RETURNED'] as const
	for (const from of steps.slice(0, steps.indexOf(to))) {
		await caller.reservationItem.advance({ id: item.id, from })
	}
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

	it('cancels a Prepared reservation with everything on it, and frees its gear', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }, {}])
		await caller.reservation.advance({ id, from: 'BOOKED' })

		const cancelled = await caller.reservation.cancel({ id })

		expect(cancelled.status).toBe('CANCELLED')
		expect(cancelled.cancelledAt).not.toBeNull()
		const reservation = await caller.reservation.get({ id })
		for (const person of reservation.people) {
			expect(person.status).toBe('CANCELLED')
			expect(person.cancelledAt).not.toBeNull()
		}
		const item = reservation.people.flatMap((person) => person.reservationItems)[0]
		expect(item?.status).toBe('CANCELLED')
		expect(item?.cancelledAt).not.toBeNull()
		expect(await isSkiAvailable(skiId, '2027-01-10', '2027-01-15')).toBe(true)
	})

	it('is refused once one item is Picked up, changing nothing', async () => {
		const firstSkiId = await createTestSki()
		const secondSkiId = await createTestSki()
		const id = await createTestReservation([{ SKI: firstSkiId }, { SKI: secondSkiId }])
		const reservation = await caller.reservation.get({ id })
		const item = reservation.people
			.flatMap((person) => person.reservationItems)
			.find((item) => item.equipmentItemId === firstSkiId)
		await caller.reservationItem.advance({ id: item?.id ?? '', from: 'BOOKED' })
		await caller.reservationItem.advance({ id: item?.id ?? '', from: 'PREPARED' })
		// the other person still holds the reservation at Booked
		expect((await caller.reservation.get({ id })).status).toBe('BOOKED')

		await expect(caller.reservation.cancel({ id })).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Vybavení už bylo vydáno, rezervaci nelze zrušit',
		})
		const after = await caller.reservation.get({ id })
		expect(after.status).toBe('BOOKED')
		expect(after.cancelledAt).toBeNull()
		expect(after.people.map((person) => person.status).sort()).toEqual(['BOOKED', 'PICKED_UP'])
		expect(await isSkiAvailable(secondSkiId, '2027-01-10', '2027-01-15')).toBe(false)
	})

	it('is refused once an accessories-only person has picked up', async () => {
		const id = await createTestReservation([{}, {}])
		const [first] = (await caller.reservation.get({ id })).people
		await caller.person.advance({ id: first?.id ?? '', from: 'BOOKED' })
		await caller.person.advance({ id: first?.id ?? '', from: 'PREPARED' })

		await expect(caller.reservation.cancel({ id })).rejects.toMatchObject({ code: 'CONFLICT' })
		expect((await caller.reservation.get({ id })).status).toBe('BOOKED')
	})

	it('the list says which reservations can still be cancelled', async () => {
		const bookedId = await createTestReservation([{}])
		const pickedUpId = await createTestReservation([{}, {}])
		const cancelledId = await createTestReservation([{}])
		const [first] = (await caller.reservation.get({ id: pickedUpId })).people
		await caller.person.advance({ id: first?.id ?? '', from: 'BOOKED' })
		await caller.person.advance({ id: first?.id ?? '', from: 'PREPARED' })
		await caller.reservation.cancel({ id: cancelledId })

		const { reservations } = await caller.reservation.list({})
		const canCancelById = Object.fromEntries(
			reservations.map((reservation) => [reservation.id, reservation.canCancel])
		)

		// the second one still reads Booked, from the person who hasn't picked up
		expect(canCancelById).toEqual({
			[bookedId]: true,
			[pickedUpId]: false,
			[cancelledId]: false,
		})
	})
})

describe('list', () => {
	/** One reservation in each of Booked, Prepared, Picked up and Cancelled. */
	const createOnePerStatus = async () => {
		const ids = {
			booked: await createTestReservation([{}]),
			prepared: await createTestReservation([{}]),
			pickedUp: await createTestReservation([{}]),
			cancelled: await createTestReservation([{}]),
		}
		await caller.reservation.advance({ id: ids.prepared, from: 'BOOKED' })
		await caller.reservation.advance({ id: ids.pickedUp, from: 'BOOKED' })
		await caller.reservation.advance({ id: ids.pickedUp, from: 'PREPARED' })
		await caller.reservation.cancel({ id: ids.cancelled })
		return ids
	}

	const listedIds = async (statuses?: GetReservationsInput['statuses']) => {
		const { reservations, totalCount } = await caller.reservation.list({ statuses })
		expect(totalCount).toBe(reservations.length)
		return reservations.map((reservation) => reservation.id).sort()
	}

	it('filters by several statuses at once', async () => {
		const ids = await createOnePerStatus()

		expect(await listedIds(['BOOKED', 'PREPARED'])).toEqual([ids.booked, ids.prepared].sort())
	})

	it('an empty or absent list of statuses does not filter', async () => {
		const ids = await createOnePerStatus()
		const all = Object.values(ids).sort()

		expect(await listedIds([])).toEqual(all)
		expect(await listedIds()).toEqual(all)
	})
})

describe('advance', () => {
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

describe('update rules', () => {
	it('swapping a Prepared ski works and frees the old one', async () => {
		const oldSkiId = await createTestSki()
		const newSkiId = await createTestSki()
		const id = await createTestReservation([{ SKI: oldSkiId }])
		await advanceItemTo(id, oldSkiId, 'PREPARED')

		await editEquipment(id, { SKI: newSkiId })

		const items = (await caller.reservation.get({ id })).people[0]?.reservationItems ?? []
		const oldItem = items.find((item) => item.equipmentItemId === oldSkiId)
		expect(oldItem?.status).toBe('CANCELLED')
		expect(oldItem?.cancelledAt).not.toBeNull()
		expect(items.find((item) => item.equipmentItemId === newSkiId)?.status).toBe('BOOKED')
		expect(await isSkiAvailable(oldSkiId, '2027-01-10', '2027-01-15')).toBe(true)
	})

	it('removing a Picked up item is refused, changing nothing', async () => {
		const skiId = await createTestSki()
		const bootId = await createTestSkiBoot()
		const id = await createTestReservation([{ SKI: skiId, SKI_BOOT: bootId }])
		await advanceItemTo(id, skiId, 'PICKED_UP')

		await expect(editEquipment(id, { SKI: null, SKI_BOOT: null })).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Vydané ani vrácené vybavení nelze odebrat ani vyměnit',
		})
		expect(await statusesByEquipment(id)).toEqual({ [skiId]: 'PICKED_UP', [bootId]: 'BOOKED' })
	})

	it('swapping a Returned item is refused', async () => {
		const skiId = await createTestSki()
		const otherSkiId = await createTestSki()
		const bootId = await createTestSkiBoot()
		const id = await createTestReservation([{ SKI: skiId, SKI_BOOT: bootId }])
		await advanceItemTo(id, skiId, 'RETURNED')

		await expect(editEquipment(id, { SKI: otherSkiId })).rejects.toMatchObject({
			code: 'CONFLICT',
		})
	})

	it('a Returned item booked by someone else since does not block the edit', async () => {
		const skiId = await createTestSki()
		const bootId = await createTestSkiBoot()
		const id = await createTestReservation([{ SKI: skiId, SKI_BOOT: bootId }])
		await advanceItemTo(id, skiId, 'RETURNED')
		await createTestReservation([{ SKI: skiId }])

		const form = await caller.reservation.getForEdit({ id })
		await caller.reservation.update({ ...form, phoneNumber: '777000000' })

		expect((await caller.reservation.get({ id })).phoneNumber).toBe('777000000')
		expect(await statusesByEquipment(id)).toEqual({ [skiId]: 'RETURNED', [bootId]: 'BOOKED' })
	})

	it("the edit form's picker still lists its Returned gear booked by someone else since", async () => {
		const skiId = await createTestSki()
		const bootId = await createTestSkiBoot()
		const id = await createTestReservation([{ SKI: skiId, SKI_BOOT: bootId }])
		await advanceItemTo(id, skiId, 'RETURNED')
		await createTestReservation([{ SKI: skiId }])

		const listed = async (excludeReservationId: string) => {
			const available = await caller.equipment.equipmentItem.findAvailable({
				type: 'SKI',
				startDate: new Date('2027-01-10'),
				endDate: new Date('2027-01-15'),
				excludeReservationId,
			})
			return available.some((item) => item.id === skiId)
		}
		expect(await listed(id)).toBe(true)
		// only for the reservation that returned it
		expect(await isSkiAvailable(skiId, '2027-01-10', '2027-01-15')).toBe(false)
	})

	it('removing a person who holds a Picked up item is refused', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{}, { SKI: skiId }])
		await advanceItemTo(id, skiId, 'PICKED_UP')
		const form = await caller.reservation.getForEdit({ id })

		await expect(
			caller.reservation.update({
				...form,
				people: form.people.filter((person) => person.equipment.SKI === null),
			})
		).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Osobu, která už má vybavení vydané, nelze odebrat',
		})
		const people = (await caller.reservation.get({ id })).people
		expect(people.map((person) => person.status).sort()).toEqual(['BOOKED', 'PICKED_UP'])
	})

	it('removing a Prepared person cancels them and frees their gear', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{}, { SKI: skiId }])
		await advanceItemTo(id, skiId, 'PREPARED')
		const form = await caller.reservation.getForEdit({ id })

		await caller.reservation.update({
			...form,
			people: form.people.filter((person) => person.equipment.SKI === null),
		})

		const removed = (await caller.reservation.get({ id })).people.find(
			(person) => person.reservationItems.length > 0
		)
		expect(removed?.status).toBe('CANCELLED')
		expect(removed?.cancelledAt).not.toBeNull()
		expect(await isSkiAvailable(skiId, '2027-01-10', '2027-01-15')).toBe(true)
	})

	it('adding an item to a Picked up person rolls them and the reservation back to Booked', async () => {
		const skiId = await createTestSki()
		const boardId = await createTestSnowboard()
		const id = await createTestReservation([{ SKI: skiId }])
		await advanceItemTo(id, skiId, 'PICKED_UP')
		expect((await caller.reservation.get({ id })).status).toBe('PICKED_UP')

		await editEquipment(id, { SNOWBOARD: boardId })

		const reservation = await caller.reservation.get({ id })
		expect(reservation.people[0]?.status).toBe('BOOKED')
		expect(reservation.status).toBe('BOOKED')
		expect(await statusesByEquipment(id)).toEqual({ [skiId]: 'PICKED_UP', [boardId]: 'BOOKED' })
	})

	it('a Returned reservation cannot be edited', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }])
		await advanceItemTo(id, skiId, 'RETURNED')

		await expect(editEquipment(id, {})).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Vrácenou rezervaci nelze upravit',
		})
	})

	it('a Cancelled reservation cannot be edited', async () => {
		const id = await createTestReservation([{}])
		// taken before the cancel, like a page left open
		const form = await caller.reservation.getForEdit({ id })
		await caller.reservation.cancel({ id })

		await expect(caller.reservation.update(form)).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Zrušenou rezervaci nelze upravit',
		})
	})

	it('the edit form gets the status of each filled slot', async () => {
		const skiId = await createTestSki()
		const bootId = await createTestSkiBoot()
		const id = await createTestReservation([{ SKI: skiId, SKI_BOOT: bootId }])
		await advanceItemTo(id, skiId, 'PICKED_UP')

		const form = await caller.reservation.getForEdit({ id })

		expect(form.people[0]?.slotStatuses).toEqual({ SKI: 'PICKED_UP', SKI_BOOT: 'BOOKED' })
	})
})
