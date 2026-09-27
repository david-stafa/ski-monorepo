import { statusStepInputSchema } from '../../schemas/statusStep'
import { protectedProcedure, router } from '../_context'
import { advanceReservationItem } from './methods/advanceReservationItem'
import { undoReservationItem } from './methods/undoReservationItem'

export const reservationItemRouter = router({
	advance: protectedProcedure
		.input(statusStepInputSchema)
		.mutation(async ({ input }) => await advanceReservationItem(input)),
	undo: protectedProcedure
		.input(statusStepInputSchema)
		.mutation(async ({ input }) => await undoReservationItem(input)),
})
