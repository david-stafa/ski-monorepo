import { createReservationInputSchema } from '../../schemas/reservation'
import { publicProcedure, router } from '../_context'
import { createReservation } from './methods/createReservation'

export const reservationRouter = router({
  create: publicProcedure
    .input(createReservationInputSchema)
    .mutation(async ({ input }) => await createReservation(input)),
})
