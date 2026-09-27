import { type GetReservationsInput, getReservationsInputSchema } from '@ski-blazek/api/schemas'
import { ReservationStatus } from '@ski-blazek/db/browser'
import z from 'zod'
import { getWeekRange } from '~/lib/dateRange'
import { listSearchParam } from '~/lib/listSearchParams'

/**
 * Search params for the return page. It is the shared reservation list input
 * with four of its optional fields pinned down:
 *
 * - `from` / `to` default to the current week, resolved in the browser for the
 *   same reason as on the pick-up page.
 * - `dateMode` is fixed to RETURN_DUE: gear due back in the window, plus
 *   everything overdue from before it — a customer who was due last Friday
 *   must not fall off the sheet because the week turned over.
 * - `statuses` defaults to Picked up, since a return sheet is a list of gear
 *   still out. `[]` is the "all statuses" choice, as on the pick-up page.
 * - `orderBy` defaults to the end date, so the overdue ones come first.
 */
export const returnSearchSchema = getReservationsInputSchema.extend({
	from: z.iso.date().default(() => getWeekRange().from),
	to: z.iso.date().default(() => getWeekRange().to),
	dateMode: z.literal('RETURN_DUE').default('RETURN_DUE'),
	statuses: listSearchParam(z.enum(ReservationStatus)).default([ReservationStatus.PICKED_UP]),
	orderBy: getReservationsInputSchema.shape.orderBy.unwrap().default('endDate'),
})

export type ReturnSearch = z.infer<typeof returnSearchSchema>

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
}: ReturnSearch): GetReservationsInput => ({
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
