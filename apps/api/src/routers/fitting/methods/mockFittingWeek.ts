import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import type { FittingWeek } from '../../../schemas/fitting'

/** The upstream app is Prague-only and the season runs in winter, so the mock
 * stamps every wall-clock time as CET when filling in the UTC instants. */
const toUtcInstant = (date: string, time: string) =>
	new Date(`${date}T${time}:00+01:00`).toISOString()

/** One appointment as it is authored below — the day is an offset from Monday
 * so the same rows land in whichever week is being viewed. */
type MockFitting = {
	id: string
	firstName: string
	lastName: string
	phone: string
	peopleCount: number
	dayOffset: number
	startTime: string
	endTime: string
	isSeasonal: boolean
}

/** Deliberately varied: a single adult, a family of four, a seasonal booking and
 * two slots back to back on the same day, so the prefill has something to chew on. */
const MOCK_FITTINGS: MockFitting[] = [
	{
		id: 'mock-1',
		firstName: 'Jana',
		lastName: 'Nováková',
		phone: '+420 602 123 456',
		peopleCount: 1,
		dayOffset: 0,
		startTime: '09:00',
		endTime: '09:15',
		isSeasonal: false,
	},
	{
		id: 'mock-2',
		firstName: 'Petr',
		lastName: 'Svoboda',
		phone: '+420 731 987 654',
		peopleCount: 4,
		dayOffset: 0,
		startTime: '09:15',
		endTime: '09:30',
		isSeasonal: false,
	},
	{
		id: 'mock-3',
		firstName: 'Lucie',
		lastName: 'Dvořáková',
		phone: '+420 608 555 111',
		peopleCount: 2,
		dayOffset: 2,
		startTime: '14:30',
		endTime: '14:45',
		isSeasonal: true,
	},
	{
		id: 'mock-4',
		firstName: 'Tomáš',
		lastName: 'Procházka',
		phone: '+420 777 222 333',
		peopleCount: 3,
		dayOffset: 4,
		startTime: '16:00',
		endTime: '16:15',
		isSeasonal: false,
	},
	{
		id: 'mock-5',
		firstName: 'Marie',
		lastName: 'Kučerová',
		phone: '+420 605 444 888',
		peopleCount: 1,
		dayOffset: 4,
		startTime: '16:15',
		endTime: '16:30',
		isSeasonal: true,
	},
]

/**
 * Stand-in for the ski-reservation feed, served while `FITTING_API_KEY` is unset
 * outside production. Same shape the real endpoint returns, so nothing
 * downstream can tell the difference.
 */
export const mockFittingWeek = (week?: string): FittingWeek => {
	const monday = startOfWeek(week ? parseISO(week) : new Date(), { weekStartsOn: 1 })

	const reservations = MOCK_FITTINGS.map(({ dayOffset, ...fitting }) => {
		const date = format(addDays(monday, dayOffset), 'yyyy-MM-dd')

		return {
			...fitting,
			date,
			startDate: toUtcInstant(date, fitting.startTime),
			endDate: toUtcInstant(date, fitting.endTime),
		}
	})

	return {
		week: {
			from: format(monday, 'yyyy-MM-dd'),
			to: format(addDays(monday, 6), 'yyyy-MM-dd'),
			timeZone: 'Europe/Prague',
		},
		count: reservations.length,
		reservations,
	}
}
