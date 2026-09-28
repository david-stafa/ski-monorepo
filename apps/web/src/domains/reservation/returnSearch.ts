import { type GetReservationsInput, getReservationsInputSchema } from '@ski-blazek/api/schemas'
import { z } from 'zod'
import { getWeekRange } from '~/lib/dateRange'

/**
 * Search params for the return page. It is the shared reservation list input
 * with no status in the URL — `RETURN_DUE` itself keeps only what still has
 * gear out, even a family that rolls up to Prepared because one child never
 * collected — and:
 *
 * - `from` / `to` default to the current week, resolved in the browser for the
 *   same reason as on the pick-up page.
 * - `dateMode` is fixed to RETURN_DUE: gear due back in the window, plus
 *   everything overdue from before it — a customer who was due last Friday
 *   must not fall off the sheet because the week turned over.
 * - `orderBy` defaults to the end date, so the overdue ones come first.
 */
export const returnSearchSchema = getReservationsInputSchema.omit({ statuses: true }).extend({
	from: z.iso.date().default(() => getWeekRange().from),
	to: z.iso.date().default(() => getWeekRange().to),
	dateMode: z.literal('RETURN_DUE').default('RETURN_DUE'),
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
	from,
	to,
	dateMode,
	kind,
	orderBy,
	orderDirection,
})
