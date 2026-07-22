import {
  createReservationInputSchema,
  getReservationsInputSchema,
  reservationIdInputSchema,
} from '../../schemas/reservation'
import { publicProcedure, router } from '../_context'
import { cancelReservation } from './methods/cancelReservation'
import { createReservation } from './methods/createReservation'
import { getReservation } from './methods/getReservation'
import { listReservations } from './methods/listReservations'

export const reservationRouter = router({
  create: publicProcedure
    .input(createReservationInputSchema)
    .mutation(async ({ input }) => await createReservation(input)),
  get: publicProcedure
    .input(reservationIdInputSchema)
    .query(async ({ input }) => await getReservation(input)),
  list: publicProcedure
    .input(getReservationsInputSchema)
    .query(async ({ input }) => await listReservations(input)),
  cancel: publicProcedure
    .input(reservationIdInputSchema)
    .mutation(async ({ input }) => await cancelReservation(input)),
})
