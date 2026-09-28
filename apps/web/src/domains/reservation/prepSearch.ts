import { type GetReservationsInput, getReservationsInputSchema } from '@ski-blazek/api/schemas'
import { z } from 'zod'
import { getWeekRange } from '~/lib/dateRange'

/**
 * Search params for the prep page, a to-do list of gear still to come off the
 * shelf. It is the shared reservation list input with no status in the URL —
 * `PREP_DUE` itself keeps only what still has something Booked, so a fully
 * prepared reservation drops off and a partly prepared one stays — and:
 *
 * - `from` / `to` default to the current week, resolved in the browser for the
 *   same reason as on the pick-up page.
 * - `dateMode` is fixed to PREP_DUE: starts in the window, plus every Prep
 *   today and Late prep from before it, so browsing next week still shows what
 *   has to be ready today.
 */
export const prepSearchSchema = getReservationsInputSchema.omit({ statuses: true }).extend({
	from: z.iso.date().default(() => getWeekRange().from),
	to: z.iso.date().default(() => getWeekRange().to),
	dateMode: z.literal('PREP_DUE').default('PREP_DUE'),
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
	from,
	to,
	dateMode,
	kind,
	orderBy,
	orderDirection,
})
