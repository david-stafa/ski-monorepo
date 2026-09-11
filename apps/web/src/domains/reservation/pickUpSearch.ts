import { type GetReservationsInput, getReservationsInputSchema } from '@ski-blazek/api/schemas'
import { ReservationStatus } from '@ski-blazek/db/browser'
import z from 'zod'
import { getWeekRange } from '~/lib/dateRange'

/**
 * Search params for the pick-up page. It is the shared reservation list input
 * with three of its optional fields pinned down:
 *
 * - `from` / `to` default to the current week. They are function defaults, not
 *   constants, so the window follows the calendar — and they are resolved here
 *   in the browser rather than on the API, whose timezone is not the shop's.
 * - `dateMode` is fixed: this page only ever asks who *collects* gear in the
 *   window, never who returns it.
 * - `status` defaults to BOOKED, since a pick-up sheet is a list of gear not
 *   handed over yet.
 */
export const pickUpSearchSchema = getReservationsInputSchema.extend({
	from: z.iso.date().default(() => getWeekRange().from),
	to: z.iso.date().default(() => getWeekRange().to),
	dateMode: z.literal('PICKUP').default('PICKUP'),
	// `null` is the "all statuses" choice, and it has to be spelled out rather
	// than left undefined: cleanEmptyParams drops undefined from the URL, so the
	// default would put BOOKED straight back and the filter could never clear.
	status: z.enum(ReservationStatus).nullish().default(ReservationStatus.BOOKED),
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
	status,
	from,
	to,
	dateMode,
	orderBy,
	orderDirection,
}: PickUpSearch): GetReservationsInput => ({
	page,
	itemsPerPage,
	search,
	// `null` means "all statuses"; the API takes undefined for that
	status: status ?? undefined,
	from,
	to,
	dateMode,
	orderBy,
	orderDirection,
})
