import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

/**
 * Moves the whole reservation one step, as the detail page's "→ … vše" does:
 * everything at its rolled-up status, items and accessories-only people alike.
 */
const advanceReservation = async (id: string) => {
	const reservation = await caller.reservation.get({ id })
	const from = reservation.status
	const people = reservation.people.filter((person) => person.status !== 'CANCELLED')
	return await caller.reservation.step({
		id,
		direction: 'forward',
		items: people
			.flatMap((person) => person.reservationItems)
			.filter((item) => item.status === from)
			.map((item) => ({ id: item.id, from })),
		people: people
			.filter((person) => person.status === from)
			.filter((person) => person.reservationItems.every((item) => item.status === 'CANCELLED'))
			.map((person) => ({ id: person.id, from })),
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
		await advanceReservation(id)

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
		await advanceReservation(ids.prepared)
		await advanceReservation(ids.pickedUp)
		await advanceReservation(ids.pickedUp)
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

describe('overdue', () => {
	// the test reservation ends 15 January 2027; this is five days later
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(new Date('2027-01-20T12:00:00Z'))
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('marks the item still out, its person and the reservation — not the gear already back', async () => {
		const dadSki = await createTestSki()
		const childSki = await createTestSki()
		const id = await createTestReservation([{ SKI: dadSki }, { SKI: childSki }])
		await advanceItemTo(id, dadSki, 'RETURNED')
		await advanceItemTo(id, childSki, 'PICKED_UP')

		const reservation = await caller.reservation.get({ id })
		const overdueByPerson = Object.fromEntries(
			reservation.people.map((person) => [person.name, person.overdue])
		)
		const overdueByEquipment = Object.fromEntries(
			reservation.people
				.flatMap((person) => person.reservationItems)
				.map((item) => [item.equipmentItemId, item.overdue])
		)

		expect(reservation.overdue).toBe(true)
		expect(overdueByPerson).toEqual({ 'Person 1': false, 'Person 2': true })
		expect(overdueByEquipment).toEqual({ [dadSki]: false, [childSki]: true })
	})

	it('an accessories-only person still Picked up is overdue', async () => {
		const id = await createTestReservation([{}])
		await advanceReservation(id)
		await advanceReservation(id)

		const reservation = await caller.reservation.get({ id })

		expect(reservation.overdue).toBe(true)
		expect(reservation.people[0]?.overdue).toBe(true)
	})

	it('gear never picked up is not overdue', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }, {}])
		await advanceReservation(id)

		expect((await caller.reservation.get({ id })).overdue).toBe(false)
	})

	it('on the end date itself nothing is overdue yet', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }], {
			startDate: '2027-01-10',
			endDate: '2027-01-20T23:59:59.999Z',
		})
		await advanceItemTo(id, skiId, 'PICKED_UP')

		expect((await caller.reservation.get({ id })).overdue).toBe(false)
	})

	it('the return list holds what is due in the window plus everything overdue', async () => {
		const window = { from: '2027-01-18', to: '2027-01-24' }
		const inWindow = { startDate: '2027-01-17', endDate: '2027-01-22' }
		const ids = {
			overdue: await createTestReservation([{}]),
			returnedEarlier: await createTestReservation([{}]),
			dueThisWeek: await createTestReservation([{}], inWindow),
			dueLater: await createTestReservation([{}], {
				startDate: '2027-01-20',
				endDate: '2027-01-30',
			}),
		}
		for (const id of Object.values(ids)) {
			await advanceReservation(id)
			await advanceReservation(id)
		}
		await advanceReservation(ids.returnedEarlier)

		const { reservations, totalCount } = await caller.reservation.list({
			...window,
			dateMode: 'RETURN_DUE',
		})
		const overdueById = Object.fromEntries(
			reservations.map((reservation) => [reservation.id, reservation.overdue])
		)

		expect(totalCount).toBe(2)
		expect(overdueById).toEqual({ [ids.overdue]: true, [ids.dueThisWeek]: false })
	})

	it('the return list still narrows by search', async () => {
		const id = await createTestReservation([{}])
		await advanceReservation(id)
		await advanceReservation(id)
		const input = { from: '2027-01-18', to: '2027-01-24', dateMode: 'RETURN_DUE' } as const

		expect((await caller.reservation.list({ ...input, search: 'Novák' })).totalCount).toBe(1)
		expect((await caller.reservation.list({ ...input, search: 'Dvořák' })).totalCount).toBe(0)
	})
})

describe('start date flags', () => {
	// the test reservation starts 10 January 2027
	const setToday = (date: string) => vi.setSystemTime(new Date(`${date}T12:00:00Z`))
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] })
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('a Booked item on its start date is Prep today, and so are its person and reservation', async () => {
		const dadSki = await createTestSki()
		const childSki = await createTestSki()
		const id = await createTestReservation([{ SKI: dadSki }, { SKI: childSki }])
		await advanceItemTo(id, dadSki, 'PREPARED')
		setToday('2027-01-10')

		const reservation = await caller.reservation.get({ id })

		expect(reservation.prepToday).toBe(true)
		expect(
			Object.fromEntries(reservation.people.map((person) => [person.name, person.prepToday]))
		).toEqual({ 'Person 1': false, 'Person 2': true })
		expect(
			Object.fromEntries(
				reservation.people
					.flatMap((person) => person.reservationItems)
					.map((item) => [item.equipmentItemId, item.prepToday])
			)
		).toEqual({ [dadSki]: false, [childSki]: true })
	})

	it('from the day after the start date it is a Late prep instead, even past the end date', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }])

		setToday('2027-01-11')
		const nextDay = await caller.reservation.get({ id })
		expect(nextDay.prepToday).toBe(false)
		expect(nextDay.latePrep).toBe(true)
		expect(nextDay.people[0]?.latePrep).toBe(true)
		expect(nextDay.people[0]?.reservationItems[0]?.latePrep).toBe(true)

		setToday('2027-01-20')
		expect((await caller.reservation.get({ id })).latePrep).toBe(true)
	})

	it('a Prepared item is not missed on its start date, only from the day after', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }])
		await advanceItemTo(id, skiId, 'PREPARED')

		setToday('2027-01-10')
		expect((await caller.reservation.get({ id })).missedPickup).toBe(false)

		setToday('2027-01-11')
		const nextDay = await caller.reservation.get({ id })
		expect(nextDay.missedPickup).toBe(true)
		expect(nextDay.latePrep).toBe(false)
		expect(nextDay.people[0]?.missedPickup).toBe(true)
		expect(nextDay.people[0]?.reservationItems[0]?.missedPickup).toBe(true)
	})

	it('a family whose child never collected is a Missed pickup and Overdue at once', async () => {
		const dadSki = await createTestSki()
		const childSki = await createTestSki()
		const id = await createTestReservation([{ SKI: dadSki }, { SKI: childSki }])
		await advanceItemTo(id, dadSki, 'PICKED_UP')
		await advanceItemTo(id, childSki, 'PREPARED')
		setToday('2027-01-20')

		const reservation = await caller.reservation.get({ id })

		expect(reservation.overdue).toBe(true)
		expect(reservation.missedPickup).toBe(true)
		expect(
			Object.fromEntries(reservation.people.map((person) => [person.name, person.missedPickup]))
		).toEqual({ 'Person 1': false, 'Person 2': true })
	})

	it('an accessories-only person still Booked counts on their own', async () => {
		const id = await createTestReservation([{}])
		setToday('2027-01-10')

		const reservation = await caller.reservation.get({ id })

		expect(reservation.prepToday).toBe(true)
		expect(reservation.people[0]?.prepToday).toBe(true)
	})

	/** Lists the window as the given page does, as `id → the flags asked for`. */
	const listFlags = async (
		dateMode: GetReservationsInput['dateMode'],
		window: { from: string; to: string },
		flags: ('prepToday' | 'latePrep' | 'missedPickup' | 'overdue')[]
	) => {
		const { reservations, totalCount } = await caller.reservation.list({ ...window, dateMode })
		expect(totalCount).toBe(reservations.length)
		return Object.fromEntries(
			reservations.map((reservation) => [
				reservation.id,
				Object.fromEntries(flags.map((flag) => [flag, reservation[flag]])),
			])
		)
	}

	it('the prep list holds the window plus everything still to prepare from before it', async () => {
		const ids = {
			late: await createTestReservation([{}]),
			today: await createTestReservation([{}], { startDate: '2027-01-20', endDate: '2027-01-22' }),
			inWindow: await createTestReservation([{}], {
				startDate: '2027-01-26',
				endDate: '2027-01-28',
			}),
			preparedEarlier: await createTestReservation([{}]),
			preparedInWindow: await createTestReservation([{}], {
				startDate: '2027-01-27',
				endDate: '2027-01-29',
			}),
			afterWindow: await createTestReservation([{}], {
				startDate: '2027-02-05',
				endDate: '2027-02-07',
			}),
		}
		await advanceReservation(ids.preparedEarlier)
		await advanceReservation(ids.preparedInWindow)
		setToday('2027-01-20')

		// looking ahead to next week
		expect(
			await listFlags('PREP_DUE', { from: '2027-01-25', to: '2027-01-31' }, [
				'prepToday',
				'latePrep',
			])
		).toEqual({
			[ids.late]: { prepToday: false, latePrep: true },
			[ids.today]: { prepToday: true, latePrep: false },
			[ids.inWindow]: { prepToday: false, latePrep: false },
		})
	})

	it('the pick-up list holds the window plus everything flagged from before it', async () => {
		const early = { startDate: '2027-01-10', endDate: '2027-01-15' }
		const today = { startDate: '2027-01-20', endDate: '2027-01-22' }
		const ids = {
			prepToday: await createTestReservation([{}], today),
			latePrep: await createTestReservation([{}], early),
			missedPickup: await createTestReservation([{}], early),
			preparedForToday: await createTestReservation([{}], today),
			pickedUpEarlier: await createTestReservation([{}], early),
			inWindow: await createTestReservation([{}], {
				startDate: '2027-01-26',
				endDate: '2027-01-28',
			}),
			pickedUpInWindow: await createTestReservation([{}], {
				startDate: '2027-01-27',
				endDate: '2027-01-29',
			}),
		}
		await advanceReservation(ids.missedPickup)
		await advanceReservation(ids.pickedUpInWindow)
		await advanceReservation(ids.pickedUpInWindow)
		await advanceReservation(ids.preparedForToday)
		await advanceReservation(ids.pickedUpEarlier)
		await advanceReservation(ids.pickedUpEarlier)
		setToday('2027-01-20')

		// looking ahead to next week; today's Prepared ones are ordinary rows of this week
		expect(
			await listFlags('PICKUP_DUE', { from: '2027-01-25', to: '2027-01-31' }, [
				'prepToday',
				'latePrep',
				'missedPickup',
			])
		).toEqual({
			[ids.prepToday]: { prepToday: true, latePrep: false, missedPickup: false },
			[ids.latePrep]: { prepToday: false, latePrep: true, missedPickup: false },
			[ids.missedPickup]: { prepToday: false, latePrep: false, missedPickup: true },
			[ids.inWindow]: { prepToday: false, latePrep: false, missedPickup: false },
		})
	})

	it('the return list keeps a family with gear out, though one child never collected', async () => {
		const dadSki = await createTestSki()
		const childSki = await createTestSki()
		const family = await createTestReservation([{ SKI: dadSki }, { SKI: childSki }])
		await advanceItemTo(family, dadSki, 'PICKED_UP')
		await advanceItemTo(family, childSki, 'PREPARED')
		const returned = await createTestReservation([{}])
		await advanceReservation(returned)
		await advanceReservation(returned)
		await advanceReservation(returned)
		const neverCollected = await createTestReservation([{}])
		await advanceReservation(neverCollected)
		setToday('2027-01-12')

		// the family rolls up to Prepared, yet the dad's skis are due back this week
		expect((await caller.reservation.get({ id: family })).status).toBe('PREPARED')
		expect(
			await listFlags('RETURN_DUE', { from: '2027-01-11', to: '2027-01-17' }, [
				'missedPickup',
				'overdue',
			])
		).toEqual({ [family]: { missedPickup: true, overdue: false } })
	})
})

describe('step', () => {
	/** Dad has a Prepared ski and Booked boots; the child has a Prepared snowboard. */
	const createPickUpFamily = async () => {
		const gear = {
			dadSki: await createTestSki(),
			dadBoots: await createTestSkiBoot(),
			childBoard: await createTestSnowboard(),
		}
		const id = await createTestReservation([
			{ SKI: gear.dadSki, SKI_BOOT: gear.dadBoots },
			{ SNOWBOARD: gear.childBoard },
		])
		await advanceItemTo(id, gear.dadSki, 'PREPARED')
		await advanceItemTo(id, gear.childBoard, 'PREPARED')
		const items = await itemsByEquipment(id)
		const itemId = (equipmentItemId: string) => items[equipmentItemId]?.id ?? ''
		return { id, gear, itemId }
	}

	it('moves exactly the listed items, leaving a Booked one behind', async () => {
		const { id, gear, itemId } = await createPickUpFamily()

		const reservation = await caller.reservation.step({
			id,
			direction: 'forward',
			items: [
				{ id: itemId(gear.dadSki), from: 'PREPARED' },
				{ id: itemId(gear.childBoard), from: 'PREPARED' },
			],
			people: [],
		})

		expect(await statusesByEquipment(id)).toEqual({
			[gear.dadSki]: 'PICKED_UP',
			[gear.dadBoots]: 'BOOKED',
			[gear.childBoard]: 'PICKED_UP',
		})
		// Dad's boots still hold him and the family back
		expect(reservation.status).toBe('BOOKED')
		const people = (await caller.reservation.get({ id })).people
		expect(Object.fromEntries(people.map((person) => [person.name, person.status]))).toEqual({
			'Person 1': 'BOOKED',
			'Person 2': 'PICKED_UP',
		})
	})

	it('sets the timestamp on the moved items only', async () => {
		const { id, gear, itemId } = await createPickUpFamily()
		const before = await itemsByEquipment(id)

		await caller.reservation.step({
			id,
			direction: 'forward',
			items: [{ id: itemId(gear.dadSki), from: 'PREPARED' }],
			people: [],
		})

		const after = await itemsByEquipment(id)
		expect(after[gear.dadSki]?.pickedUpAt).not.toBeNull()
		expect(after[gear.dadSki]?.preparedAt).toEqual(before[gear.dadSki]?.preparedAt)
		expect(after[gear.childBoard]?.pickedUpAt).toBeNull()
		expect(after[gear.dadBoots]?.preparedAt).toBeNull()
	})

	it('stepping back the same targets undoes exactly that step', async () => {
		const { id, gear, itemId } = await createPickUpFamily()
		// the child's board went out earlier, on its own
		await caller.reservationItem.advance({ id: itemId(gear.childBoard), from: 'PREPARED' })
		const handedOut = [{ id: itemId(gear.dadSki), from: 'PREPARED' as const }]
		await caller.reservation.step({ id, direction: 'forward', items: handedOut, people: [] })

		const reservation = await caller.reservation.step({
			id,
			direction: 'back',
			items: handedOut.map((target) => ({ id: target.id, from: 'PICKED_UP' as const })),
			people: [],
		})

		expect(await statusesByEquipment(id)).toEqual({
			[gear.dadSki]: 'PREPARED',
			[gear.dadBoots]: 'BOOKED',
			[gear.childBoard]: 'PICKED_UP',
		})
		expect((await itemsByEquipment(id))[gear.dadSki]?.pickedUpAt).toBeNull()
		expect(reservation.status).toBe('BOOKED')
	})

	it('one item already moved from another screen refuses the whole step', async () => {
		const { id, gear, itemId } = await createPickUpFamily()
		// a colleague hands the board out while this page still shows it Prepared
		await caller.reservationItem.advance({ id: itemId(gear.childBoard), from: 'PREPARED' })

		await expect(
			caller.reservation.step({
				id,
				direction: 'forward',
				items: [
					{ id: itemId(gear.dadSki), from: 'PREPARED' },
					{ id: itemId(gear.childBoard), from: 'PREPARED' },
				],
				people: [],
			})
		).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Rezervaci mezitím změnil někdo jiný. Obnovte stránku a zkuste to znovu.',
		})
		expect(await statusesByEquipment(id)).toEqual({
			[gear.dadSki]: 'PREPARED',
			[gear.dadBoots]: 'BOOKED',
			[gear.childBoard]: 'PICKED_UP',
		})
	})

	it('refuses an item of another reservation, and a missing reservation', async () => {
		const { id, gear, itemId } = await createPickUpFamily()
		const otherId = await createTestReservation([{ SKI: await createTestSki() }])

		await expect(
			caller.reservation.step({
				id: otherId,
				direction: 'forward',
				items: [{ id: itemId(gear.dadSki), from: 'PREPARED' }],
				people: [],
			})
		).rejects.toMatchObject({ code: 'NOT_FOUND' })
		await expect(
			caller.reservation.step({
				id: 'missing',
				direction: 'forward',
				items: [{ id: itemId(gear.dadSki), from: 'PREPARED' }],
				people: [],
			})
		).rejects.toMatchObject({ code: 'NOT_FOUND' })
		expect((await statusesByEquipment(id))[gear.dadSki]).toBe('PREPARED')
	})

	it('a Returned item cannot go further, a Cancelled one cannot move at all', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }])
		await advanceItemTo(id, skiId, 'RETURNED')
		const itemId = (await itemsByEquipment(id))[skiId]?.id ?? ''

		await expect(
			caller.reservation.step({
				id,
				direction: 'forward',
				items: [{ id: itemId, from: 'RETURNED' }],
				people: [],
			})
		).rejects.toMatchObject({ code: 'CONFLICT' })

		const cancelledSki = await createTestSki()
		const cancelledId = await createTestReservation([{ SKI: cancelledSki }])
		await caller.reservation.cancel({ id: cancelledId })
		const cancelledItemId = (await itemsByEquipment(cancelledId))[cancelledSki]?.id ?? ''
		await expect(
			caller.reservation.step({
				id: cancelledId,
				direction: 'back',
				items: [{ id: cancelledItemId, from: 'CANCELLED' }],
				people: [],
			})
		).rejects.toMatchObject({ code: 'CONFLICT' })
	})

	it('undoing a return is refused once someone else has booked the gear', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }])
		await advanceItemTo(id, skiId, 'RETURNED')
		const itemId = (await itemsByEquipment(id))[skiId]?.id ?? ''
		// the ski is back early, so another customer takes it for the same dates
		await createTestReservation([{ SKI: skiId }])

		await expect(
			caller.reservation.step({
				id,
				direction: 'back',
				items: [{ id: itemId, from: 'RETURNED' }],
				people: [],
			})
		).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Vybavení si mezitím zarezervoval někdo jiný, vrácení nelze vzít zpět',
		})
		expect(await statusesByEquipment(id)).toEqual({ [skiId]: 'RETURNED' })
	})

	it('moves an accessories-only person by hand, and refuses a person with gear', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }, {}])
		const people = (await caller.reservation.get({ id })).people
		const skier = people.find((person) => person.name === 'Person 1')
		const goggles = people.find((person) => person.name === 'Person 2')
		if (!skier || !goggles) throw new Error('the family is incomplete')

		await caller.reservation.step({
			id,
			direction: 'forward',
			items: [],
			people: [{ id: goggles.id, from: 'BOOKED' }],
		})
		const statusesByPerson = async () =>
			Object.fromEntries(
				(await caller.reservation.get({ id })).people.map((person) => [person.name, person.status])
			)
		expect(await statusesByPerson()).toEqual({ 'Person 1': 'BOOKED', 'Person 2': 'PREPARED' })

		await expect(
			caller.reservation.step({
				id,
				direction: 'forward',
				items: [],
				people: [{ id: skier.id, from: 'BOOKED' }],
			})
		).rejects.toMatchObject({
			code: 'CONFLICT',
			message: 'Osoba má vybavení, posuňte jednotlivé položky',
		})
		expect(await statusesByPerson()).toEqual({ 'Person 1': 'BOOKED', 'Person 2': 'PREPARED' })
	})

	it('refuses a step with nothing in it', async () => {
		const { id } = await createPickUpFamily()

		await expect(
			caller.reservation.step({ id, direction: 'forward', items: [], people: [] })
		).rejects.toMatchObject({ code: 'CONFLICT', message: 'Není co posunout' })
	})

	it('an item listed twice still moves only one step', async () => {
		const { id, gear, itemId } = await createPickUpFamily()
		const ski = { id: itemId(gear.dadSki), from: 'PREPARED' as const }

		await expect(
			caller.reservation.step({ id, direction: 'forward', items: [ski, ski], people: [] })
		).rejects.toMatchObject({ code: 'BAD_REQUEST' })
		expect((await statusesByEquipment(id))[gear.dadSki]).toBe('PREPARED')
	})

	it('moves a whole mixed family to its next status, as the detail page does', async () => {
		const skiId = await createTestSki()
		const id = await createTestReservation([{ SKI: skiId }, {}])
		const reservation = await caller.reservation.get({ id })
		const item = reservation.people.flatMap((person) => person.reservationItems)[0]
		const goggles = reservation.people.find((person) => person.reservationItems.length === 0)
		if (!item || !goggles) throw new Error('the family is incomplete')

		const prepared = await caller.reservation.step({
			id,
			direction: 'forward',
			items: [{ id: item.id, from: 'BOOKED' }],
			people: [{ id: goggles.id, from: 'BOOKED' }],
		})

		expect(prepared.status).toBe('PREPARED')
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
