import { describe, expect, it } from 'vitest'
import { caller, createTestReservation } from '../../../test/helpers'

const createSki = async () => {
	const ski = await caller.equipment.ski.create({
		brand: 'Atomic',
		model: 'Redster',
		length: 170,
		isOld: false,
		isVIP: false,
		isKids: false,
		gender: null,
	})
	return ski.equipmentItem.id
}

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
		const skiId = await createSki()

		const id = await createTestReservation([{ SKI: skiId }])
		const reservation = await caller.reservation.get({ id })

		expect(reservation.status).toBe('BOOKED')
		expect(reservation.people).toHaveLength(1)
		expect(reservation.people[0]?.reservationItems[0]?.equipmentItemId).toBe(skiId)
	})

	it('books its people and their items too', async () => {
		const skiId = await createSki()

		const id = await createTestReservation([{ SKI: skiId }, {}])
		const reservation = await caller.reservation.get({ id })

		expect(reservation.people.map((person) => person.status)).toEqual(['BOOKED', 'BOOKED'])
		expect(reservation.people[0]?.reservationItems.map((item) => item.status)).toEqual(['BOOKED'])
	})
})

describe('availability', () => {
	// createTestReservation books 2027-01-10 → 2027-01-15
	it('a Booked item blocks overlapping dates', async () => {
		const skiId = await createSki()
		await createTestReservation([{ SKI: skiId }])

		expect(await isSkiAvailable(skiId, '2027-01-14', '2027-01-20')).toBe(false)
	})

	it('a Booked item leaves the dates after it free', async () => {
		const skiId = await createSki()
		await createTestReservation([{ SKI: skiId }])

		expect(await isSkiAvailable(skiId, '2027-01-15', '2027-01-20')).toBe(true)
	})

	it("a cancelled reservation's item is free again", async () => {
		const skiId = await createSki()
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
