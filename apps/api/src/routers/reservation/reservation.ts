import {
  createReservationInputSchema,
  getReservationsInputSchema,
  getSingleReservationInputSchema,
} from '../../schemas/reservation'
import { publicProcedure, router } from '../_context'
import { createReservation } from './methods/createReservation'
import { getReservation } from './methods/getReservation'
import { listReservations } from './methods/getReservations'

export const reservationRouter = router({
  create: publicProcedure
    .input(createReservationInputSchema)
    .mutation(async ({ input }) => await createReservation(input)),
  get: publicProcedure
    .input(getSingleReservationInputSchema)
    .query(async ({ input }) => await getReservation(input)),
  list: publicProcedure
    .input(getReservationsInputSchema)
    .query(async ({ input }) => await listReservations(input)),
})
