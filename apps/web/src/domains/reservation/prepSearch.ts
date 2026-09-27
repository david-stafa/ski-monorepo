import { type GetReservationsInput, getReservationsInputSchema } from '@ski-blazek/api/schemas'
import { ReservationStatus } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { getWeekRange } from '~/lib/dateRange'

// No status in the URL: the prep view is a to-do list, so it is fixed to Booked
// (see toListInput). A fully prepared reservation drops off it; a partly
// prepared one stays, because it still rolls up to Booked.
export const prepSearchSchema = getReservationsInputSchema.omit({ statuses: true }).extend({
	from: z.iso.date().default(() => getWeekRange().from),
	to: z.iso.date().default(() => getWeekRange().to),
	dateMode: z.literal('PICKUP').default('PICKUP'),
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
	from,
	to,
	dateMode,
	kind,
	orderBy,
	orderDirection,
}: PrepSearch): GetReservationsInput => ({
	page,
	itemsPerPage,
	search,
	statuses: [ReservationStatus.BOOKED],
	from,
	to,
	dateMode,
	kind,
	orderBy,
	orderDirection,
})
