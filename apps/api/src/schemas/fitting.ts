import z from 'zod'

export const getFittingsInputSchema = z.object({
	// date-only ISO string ('2026-10-19') — any day inside the wanted week.
	// Omitted means the current week in the upstream app's timezone.
	week: z.iso.date().optional(),
})

export type GetFittingsInput = z.infer<typeof getFittingsInputSchema>

/**
 * One fitting appointment from the ski-reservation app.
 *
 * Unrelated to this app's own `Reservation` — a fitting is a 15-minute slot for
 * measuring people up, booked by the customer themselves, while a reservation
 * is the multi-day rental of the gear that comes out of it.
 */
const fittingSchema = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	phone: z.string(),
	peopleCount: z.number().int(),
	// Prague-local calendar date and wall-clock times, pre-split upstream
	date: z.iso.date(),
	startTime: z.string(),
	endTime: z.string(),
	// the same instants in UTC, for anything that needs to do real date math
	startDate: z.iso.datetime(),
	endDate: z.iso.datetime(),
	isSeasonal: z.boolean(),
})

export type Fitting = z.infer<typeof fittingSchema>

export const fittingWeekSchema = z.object({
	week: z.object({
		from: z.iso.date(),
		to: z.iso.date(),
		timeZone: z.string(),
	}),
	count: z.number().int(),
	reservations: z.array(fittingSchema),
})

export type FittingWeek = z.infer<typeof fittingWeekSchema>
