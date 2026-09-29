/**
 * Fills the DEV database with demo reservations covering every flag edge case
 * (Prep today, Late prep, Missed pickup, Overdue), dated relative to today.
 * Everything it makes is named / branded "DEMO", so `--clean` removes exactly
 * that and nothing else. Runs through the real tRPC router, like the tests.
 *
 *   node demo.js           → removes old DEMO data, then creates it fresh
 *   node demo.js --clean   → only removes it
 *   node demo.js --check 2026-09-28 2026-10-04 → what each counter page lists
 */
import { prisma } from '@ski-blazek/db'
import { addDays, endOfDay, startOfDay } from 'date-fns'
import { appRouter } from '../src/routers/_app'
import { createEmptyEquipment } from '../src/schemas/reservation'
import { seasonReturnDeadline } from '../src/schemas/season'

const caller = appRouter.createCaller({
	user: {
		id: 'demo-seed',
		name: 'Demo Seed',
		email: 'demo@example.com',
		emailVerified: true,
		image: null,
		banned: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
})

type Target = 'BOOKED' | 'PREPARED' | 'PICKED_UP' | 'RETURNED' | 'CANCELLED'
type DemoPerson = { name: string; gear: 'ski' | 'skiAndBoots' | 'none'; to: Target }
type DemoCase = {
	name: string
	start: number // days from today
	end: number | 'season'
	people: DemoPerson[]
	cancelReservation?: boolean
}

const one = (to: Target, gear: DemoPerson['gear'] = 'ski'): DemoPerson[] => [
	{ name: 'Petr', gear, to },
]
const family = (dad: Target, kid: Target): DemoPerson[] => [
	{ name: 'Táta', gear: 'skiAndBoots', to: dad },
	{ name: 'Dítě', gear: 'ski', to: kid },
]

// Names say what the reservation shows and on which page (P = Příprava,
// V = Výdej, R = Vrácení), in the default "this week" view.
const CASES: DemoCase[] = [
	// ── Příprava ──
	{ name: 'DEMO P1 Prep today', start: 0, end: 3, people: one('BOOKED') },
	{ name: 'DEMO P2 Prep today – jen doplňky', start: 0, end: 2, people: one('BOOKED', 'none') },
	{
		name: 'DEMO P3 Prep today – napůl připraveno (táta ne-missed)',
		start: 0,
		end: 4,
		people: family('PREPARED', 'BOOKED'),
	},
	{ name: 'DEMO P4 Late prep – 3 dny', start: -3, end: 4, people: one('BOOKED') },
	{
		name: 'DEMO P5 Late prep – celé termíny v minulosti',
		start: -20,
		end: -12,
		people: one('BOOKED'),
	},
	{
		name: 'DEMO P6 Late prep + Missed pickup (včera)',
		start: -1,
		end: 5,
		people: family('PREPARED', 'BOOKED'),
	},
	{ name: 'DEMO P7 bez příznaku – příprava tento týden', start: 2, end: 6, people: one('BOOKED') },
	{
		name: 'DEMO P8 bez příznaku – příští týden (jen při listování)',
		start: 8,
		end: 12,
		people: one('BOOKED'),
	},

	// ── Výdej ──
	{
		name: 'DEMO V1 bez příznaku – připraveno, začíná dnes',
		start: 0,
		end: 3,
		people: one('PREPARED'),
	},
	{ name: 'DEMO V2 Missed pickup – 2 dny', start: -2, end: 3, people: one('PREPARED') },
	{
		name: 'DEMO V3 Missed pickup – celé termíny v minulosti',
		start: -14,
		end: -7,
		people: one('PREPARED'),
	},
	{
		name: 'DEMO V4 Missed pickup – jen doplňky',
		start: -3,
		end: 2,
		people: one('PREPARED', 'none'),
	},
	{
		name: 'DEMO V5 Missed pickup + Overdue (dítě nepřišlo)',
		start: -10,
		end: -4,
		people: family('PICKED_UP', 'PREPARED'),
	},
	{ name: 'DEMO V6 bez příznaku – výdej zítra', start: 1, end: 5, people: one('PREPARED') },

	// ── Vrácení ──
	{ name: 'DEMO R1 Overdue – 3 dny', start: -8, end: -3, people: one('PICKED_UP') },
	{
		name: 'DEMO R2 Overdue – jen doplňky',
		start: -6,
		end: -2,
		people: one('PICKED_UP', 'none'),
	},
	{
		name: 'DEMO R3 bez příznaku – vrací dnes (ještě ne po termínu)',
		start: -4,
		end: 0,
		people: one('PICKED_UP'),
	},
	{ name: 'DEMO R4 bez příznaku – vrací tento týden', start: -2, end: 3, people: one('PICKED_UP') },
	{
		name: 'DEMO R5 Overdue – táta vrátil, dítě ne',
		start: -9,
		end: -2,
		people: family('RETURNED', 'PICKED_UP'),
	},
	{
		name: 'DEMO R6 Missed pickup na vrácení (souhrnně Připraveno)',
		start: -2,
		end: 2,
		people: family('PICKED_UP', 'PREPARED'),
	},
	{
		name: 'DEMO R7 sezónní – venku do termínu',
		start: -20,
		end: 'season',
		people: one('PICKED_UP'),
	},

	// ── Nikde / bez příznaku ──
	{ name: 'DEMO X1 vráceno dřív – nikde', start: -5, end: 5, people: one('RETURNED') },
	{ name: 'DEMO X2 vráceno – hotovo', start: -15, end: -10, people: one('RETURNED') },
	{
		name: 'DEMO X3 zrušeno po začátku – bez příznaku',
		start: -3,
		end: 2,
		people: one('BOOKED'),
		cancelReservation: true,
	},
	{
		name: 'DEMO X4 zrušené dítě neblokuje rodinu (jen R)',
		start: -2,
		end: 3,
		people: family('PICKED_UP', 'CANCELLED'),
	},
]

const STEPS = ['BOOKED', 'PREPARED', 'PICKED_UP', 'RETURNED'] as const

let gearCount = 0
const createSki = async () => {
	gearCount += 1
	const ski = await caller.equipment.ski.create({
		brand: 'DEMO',
		model: `Demo ${gearCount}`,
		length: 150 + (gearCount % 40),
		isOld: false,
		isVIP: false,
		isKids: false,
		gender: null,
	})
	return ski.equipmentItem.id
}
const createBoots = async () => {
	gearCount += 1
	const boot = await caller.equipment.skiBoot.create({
		brand: 'DEMO',
		model: `Demo ${gearCount}`,
		length: 26.5,
		color: null,
		isKids: false,
		gender: null,
	})
	return boot.equipmentItem.id
}

const clean = async () => {
	const { count } = await prisma.reservation.deleteMany({ where: { name: { startsWith: 'DEMO' } } })
	const gear = await prisma.equipmentItem.deleteMany({
		where: { OR: [{ ski: { brand: 'DEMO' } }, { skiBoot: { brand: 'DEMO' } }] },
	})
	console.log(`removed ${count} DEMO reservations and ${gear.count} DEMO gear items`)
}

const seed = async () => {
	const today = startOfDay(new Date())
	for (const demo of CASES) {
		const equipmentByPerson = []
		for (const person of demo.people) {
			const equipment = createEmptyEquipment()
			if (person.gear !== 'none') equipment.SKI = await createSki()
			if (person.gear === 'skiAndBoots') equipment.SKI_BOOT = await createBoots()
			equipmentByPerson.push(equipment)
		}

		const { reservation } = await caller.reservation.create({
			name: demo.name,
			phoneNumber: '777000000',
			note: null,
			startDate: addDays(today, demo.start),
			endDate:
				demo.end === 'season' ? seasonReturnDeadline(today) : endOfDay(addDays(today, demo.end)),
			seasonal: demo.end === 'season',
			people: demo.people.map((person, index) => ({
				name: person.name,
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
				equipment: equipmentByPerson[index] ?? createEmptyEquipment(),
			})),
		})

		// people come back in no set order, so match them by name
		const saved = await caller.reservation.get({ id: reservation.id })
		for (const person of demo.people) {
			const savedPerson = saved.people.find((candidate) => candidate.name === person.name)
			if (!savedPerson) throw new Error(`${demo.name}: ${person.name} not saved`)
			if (person.to === 'CANCELLED') {
				await caller.person.cancel({ id: savedPerson.id })
				continue
			}
			for (const from of STEPS.slice(0, STEPS.indexOf(person.to))) {
				if (savedPerson.reservationItems.length === 0) {
					await caller.person.advance({ id: savedPerson.id, from })
				} else {
					for (const item of savedPerson.reservationItems) {
						await caller.reservationItem.advance({ id: item.id, from })
					}
				}
			}
		}
		if (demo.cancelReservation) await caller.reservation.cancel({ id: reservation.id })

		const after = await caller.reservation.get({ id: reservation.id })
		const flags = (['prepToday', 'latePrep', 'missedPickup', 'overdue'] as const).filter(
			(flag) => after[flag]
		)
		console.log(`${after.status.padEnd(9)} ${flags.join(', ').padEnd(24)} ${demo.name}`)
	}
}

/** Which DEMO reservations each counter page lists for a week, as the pages ask. */
const check = async (from: string, to: string) => {
	for (const dateMode of ['PREP_DUE', 'PICKUP_DUE', 'RETURN_DUE'] as const) {
		const { reservations } = await caller.reservation.list({
			from,
			to,
			dateMode,
			search: 'DEMO',
			itemsPerPage: 100,
		})
		console.log(`\n${dateMode} ${from}…${to}`)
		for (const reservation of reservations) console.log(`  ${reservation.name}`)
	}
}

if (process.argv.includes('--check')) {
	const [from = '', to = ''] = process.argv.slice(process.argv.indexOf('--check') + 1)
	await check(from, to)
} else {
	await clean()
	if (!process.argv.includes('--clean')) await seed()
}
await prisma.$disconnect()
