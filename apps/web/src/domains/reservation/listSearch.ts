import { getReservationsInputSchema } from '@ski-blazek/api/schemas'
import { ReservationStatus } from '@ski-blazek/db/browser'
import z from 'zod'
import { listSearchParam } from '~/lib/listSearchParams'

/**
 * Search params for the main reservation list: the shared list input, with
 * `statuses` read from the URL's comma-separated form. No default — the main
 * list shows every status until one is picked. `dateMode` is fixed to WITHIN,
 * so `from` and `to` are each optional: starts on or after `from`, ends on or
 * before `to`.
 */
export const listSearchSchema = getReservationsInputSchema.extend({
	statuses: listSearchParam(z.enum(ReservationStatus)).optional(),
	dateMode: z.literal('WITHIN').default('WITHIN'),
})
