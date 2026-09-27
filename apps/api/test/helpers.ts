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
 * empty). Runs 10–15 January 2027 unless `dates` say otherwise. Returns the new
 * reservation's id.
 *
 *   await createTestReservation([{ SKI: ski.equipmentItem.id }, {}])
 */
export const createTestReservation = async (
	people: Partial<PersonEquipment>[],
	dates: { startDate: string; endDate: string } = { startDate: '2027-01-10', endDate: '2027-01-15' }
) => {
	const { reservation } = await caller.reservation.create({
		name: 'Jan Novák',
		phoneNumber: '777123456',
		note: null,
		startDate: new Date(dates.startDate),
		endDate: new Date(dates.endDate),
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

/** Adds a ski to the stock. Returns its equipment item id, the one a
 * reservation books. */
export const createTestSki = async () => {
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

/** Adds a ski boot to the stock. Returns its equipment item id. */
export const createTestSkiBoot = async () => {
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

/** Adds a snowboard to the stock. Returns its equipment item id. */
export const createTestSnowboard = async () => {
	const board = await caller.equipment.snowboard.create({
		brand: 'Burton',
		model: 'Custom',
		length: 156,
		gender: null,
	})
	return board.equipmentItem.id
}
