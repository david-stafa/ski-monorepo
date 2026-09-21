import { getFittingsInputSchema } from '../../schemas/fitting'
import { protectedProcedure, router } from '../_context'
import { listWeeklyFittings } from './methods/listWeeklyFittings'

/**
 * Read-only feed of fitting appointments from the ski-reservation app.
 *
 * `protectedProcedure` because the payload carries customers' names, emails and
 * phone numbers — leaving it public would move the exposure from the upstream
 * app into this one.
 */
export const fittingRouter = router({
	listWeekly: protectedProcedure
		.input(getFittingsInputSchema)
		.query(async ({ input }) => await listWeeklyFittings(input)),
})
