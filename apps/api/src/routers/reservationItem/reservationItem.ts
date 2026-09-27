import { reservationItemStepInputSchema } from '../../schemas/reservationItem'
import { protectedProcedure, router } from '../_context'
import { advanceReservationItem } from './methods/advanceReservationItem'
import { undoReservationItem } from './methods/undoReservationItem'

export const reservationItemRouter = router({
	advance: protectedProcedure
		.input(reservationItemStepInputSchema)
		.mutation(async ({ input }) => await advanceReservationItem(input)),
	undo: protectedProcedure
		.input(reservationItemStepInputSchema)
		.mutation(async ({ input }) => await undoReservationItem(input)),
})
