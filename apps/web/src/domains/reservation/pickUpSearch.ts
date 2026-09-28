import { type GetReservationsInput, getReservationsInputSchema } from '@ski-blazek/api/schemas'
import { z } from 'zod'
import { getWeekRange } from '~/lib/dateRange'

/**
 * Search params for the pick-up page. It is the shared reservation list input
 * with no status in the URL — `PICKUP_DUE` itself keeps only what still has
 * something Booked or Prepared, so a reservation doesn't drop off the moment
 * it's prepared — and:
 *
 * - `from` / `to` default to the current week. They are function defaults, not
 *   constants, so the window follows the calendar — and they are resolved here
 *   in the browser rather than on the API, whose timezone is not the shop's.
 * - `dateMode` is fixed to PICKUP_DUE: starts in the window, plus every Prep
 *   today, Late prep and Missed pickup from before it.
 */
export const pickUpSearchSchema = getReservationsInputSchema.omit({ statuses: true }).extend({
	from: z.iso.date().default(() => getWeekRange().from),
	to: z.iso.date().default(() => getWeekRange().to),
	dateMode: z.literal('PICKUP_DUE').default('PICKUP_DUE'),
})

export type PickUpSearch = z.infer<typeof pickUpSearchSchema>

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
}: PickUpSearch): GetReservationsInput => ({
	page,
	itemsPerPage,
	search,
	from,
	to,
	dateMode,
	kind,
	orderBy,
	orderDirection,
})
