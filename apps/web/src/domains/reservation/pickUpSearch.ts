import { type GetReservationsInput, getReservationsInputSchema } from '@ski-blazek/api/schemas'
import { ReservationStatus } from '@ski-blazek/db/browser'
import z from 'zod'
import { getWeekRange } from '~/lib/dateRange'
import { listSearchParam } from '~/lib/listSearchParams'

/**
 * Search params for the pick-up page. It is the shared reservation list input
 * with three of its optional fields pinned down:
 *
 * - `from` / `to` default to the current week. They are function defaults, not
 *   constants, so the window follows the calendar — and they are resolved here
 *   in the browser rather than on the API, whose timezone is not the shop's.
 * - `dateMode` is fixed: this page only ever asks who *collects* gear in the
 *   window, never who returns it.
 * - `statuses` defaults to Booked + Prepared, since a pick-up sheet is a list
 *   of gear not handed over yet — a reservation must not drop off it the
 *   moment it's prepared.
 */
export const pickUpSearchSchema = getReservationsInputSchema.extend({
	from: z.iso.date().default(() => getWeekRange().from),
	to: z.iso.date().default(() => getWeekRange().to),
	dateMode: z.literal('PICKUP').default('PICKUP'),
	// `[]` is the "all statuses" choice. It stays in the URL as `statuses=`
	// (cleanEmptyParams drops only undefined and ''), so the default can't put
	// itself back and the filter can be cleared.
	statuses: listSearchParam(z.enum(ReservationStatus)).default([
		ReservationStatus.BOOKED,
		ReservationStatus.PREPARED,
	]),
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
	statuses,
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
	statuses,
	from,
	to,
	dateMode,
	kind,
	orderBy,
	orderDirection,
})
