import { describe, expect, it } from 'vitest'
import { caller, createTestReservation } from '../../../test/helpers'

describe('reservation', () => {
	it('starts out Booked', async () => {
		const ski = await caller.equipment.ski.create({
			brand: 'Atomic',
			model: 'Redster',
			length: 170,
			isOld: false,
			isVIP: false,
			isKids: false,
			gender: null,
		})

		const id = await createTestReservation([{ SKI: ski.equipmentItem.id }])
		const reservation = await caller.reservation.get({ id })

		expect(reservation.status).toBe('BOOKED')
		expect(reservation.people).toHaveLength(1)
		expect(reservation.people[0]?.reservationItems[0]?.equipmentItemId).toBe(ski.equipmentItem.id)
	})
})
