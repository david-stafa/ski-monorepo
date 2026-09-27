import { appRouter } from '../src/routers/_app'
import { createEmptyEquipment, type PersonEquipment } from '../src/schemas/reservation'

/** The real router, called as a logged-in staff member. No HTTP, no cookies —
 * `createCaller` skips straight to the procedures, auth middleware included. */
export const caller: ReturnType<typeof appRouter.createCaller> = appRouter.createCaller({
	user: {
		id: 'test-user',
		name: 'Test User',
		email: 'test@example.com',
		emailVerified: true,
		image: null,
		banned: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
})

/**
 * Creates a reservation through `reservation.create`, one person per entry in
 * `people`, each holding the equipment given for them (unlisted slots stay
 * empty). Returns the new reservation's id.
 *
 *   await createTestReservation([{ SKI: ski.equipmentItem.id }, {}])
 */
export const createTestReservation = async (people: Partial<PersonEquipment>[]) => {
	const { reservation } = await caller.reservation.create({
		name: 'Jan Novák',
		phoneNumber: '777123456',
		note: null,
		startDate: new Date('2027-01-10'),
		endDate: new Date('2027-01-15'),
		seasonal: false,
		people: people.map((equipment, index) => ({
			name: `Person ${index + 1}`,
			weight: 70,
			height: 175,
			age: 30,
			gender: 'MALE',
			poles: null,
			backProtection: false,
			skiCover: false,
			bootCover: false,
			goggles: null,
			level: null,
			note: null,
			equipment: { ...createEmptyEquipment(), ...equipment },
		})),
	})
	return reservation.id
}
