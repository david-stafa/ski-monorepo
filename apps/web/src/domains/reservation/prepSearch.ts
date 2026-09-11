import { type GetReservationsInput, getReservationsInputSchema } from '@ski-blazek/api/schemas'
import { ReservationStatus } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { getWeekRange } from '~/lib/dateRange'

export const prepSearchSchema = getReservationsInputSchema.extend({
	from: z.iso.date().default(() => getWeekRange().from),
	to: z.iso.date().default(() => getWeekRange().to),
	dateMode: z.literal('PICKUP').default('PICKUP'),
	// only booked - do now want to change statuses in this view
	status: z.literal(ReservationStatus.BOOKED).default(ReservationStatus.BOOKED),
})

export type PrepSearch = z.infer<typeof prepSearchSchema>

/**
 * The `reservation.list` input for a given search. Fields are listed by hand so
 * a non-query param can't leak into `loaderDeps`, and so the loader and the
 * component build the same query key.
 * @see https://tanstack.com/router/latest/docs/guide/data-loading#using-loaderdeps-to-access-search-params
 */
export const toListInput = ({
	page,
	itemsPerPage,
	search,
	status,
	from,
	to,
	dateMode,
	orderBy,
	orderDirection,
}: PrepSearch): GetReservationsInput => ({
	page,
	itemsPerPage,
	search,
	status,
	from,
	to,
	dateMode,
	orderBy,
	orderDirection,
})
