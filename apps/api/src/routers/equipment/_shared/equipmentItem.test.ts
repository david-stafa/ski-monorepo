import { describe, expect, it } from 'vitest'
import { caller, createTestReservation, createTestSki } from '../../../../test/helpers'

describe('equipmentItem.findReservations', () => {
	it('returns the item with only its own subtype filled in', async () => {
		const skiId = await createTestSki()

		const { equipmentItem } = await caller.equipment.equipmentItem.findReservations({ id: skiId })

		expect(equipmentItem.type).toBe('SKI')
		expect(equipmentItem.ski?.brand).toBe('Atomic')
		expect(equipmentItem.skiBoot).toBeNull()
		expect(equipmentItem.snowboard).toBeNull()
		expect(equipmentItem.snowboardBoot).toBeNull()
		expect(equipmentItem.helmet).toBeNull()
	})

	it('lists the bookings newest first', async () => {
		const skiId = await createTestSki()
		const january = await createTestReservation([{ SKI: skiId }], {
			startDate: '2027-01-10',
			endDate: '2027-01-15',
		})
		const february = await createTestReservation([{ SKI: skiId }], {
			startDate: '2027-02-10',
			endDate: '2027-02-15',
		})

		const { reservations } = await caller.equipment.equipmentItem.findReservations({ id: skiId })

		expect(reservations.map((item) => item.reservation.id)).toEqual([february, january])
	})

	it('leaves out cancelled bookings', async () => {
		const skiId = await createTestSki()
		const cancelled = await createTestReservation([{ SKI: skiId }], {
			startDate: '2027-01-10',
			endDate: '2027-01-15',
		})
		await caller.reservation.cancel({ id: cancelled })
		const kept = await createTestReservation([{ SKI: skiId }], {
			startDate: '2027-02-10',
			endDate: '2027-02-15',
		})

		const { reservations } = await caller.equipment.equipmentItem.findReservations({ id: skiId })

		expect(reservations.map((item) => item.reservation.id)).toEqual([kept])
	})

	it('is NOT_FOUND for an unknown id', async () => {
		await expect(
			caller.equipment.equipmentItem.findReservations({ id: 'does-not-exist' })
		).rejects.toMatchObject({ code: 'NOT_FOUND' })
	})
})
