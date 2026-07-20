import {
  createReservationInputSchema,
  getReservationsInputSchema,
  getSingleReservationInputSchema,
} from '../../schemas/reservation'
import { publicProcedure, router } from '../_context'
import { createReservation } from './methods/createReservation'
import { getReservation } from './methods/getReservation'
import { getReservations } from './methods/getReservations'

export const reservationRouter = router({
  create: publicProcedure
    .input(createReservationInputSchema)
    .mutation(async ({ input }) => await createReservation(input)),
  getReservation: publicProcedure
    .input(getSingleReservationInputSchema)
    .query(async ({ input }) => await getReservation(input)),
  getReservations: publicProcedure
    .input(getReservationsInputSchema)
    .query(async ({ input }) => await getReservations(input)),
})
