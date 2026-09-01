import {
	createReservationInputSchema,
	getReservationsInputSchema,
	reservationIdInputSchema,
} from '../../schemas/reservation'
import { protectedProcedure, router } from '../_context'
import { cancelReservation } from './methods/cancelReservation'
import { createReservation } from './methods/createReservation'
import { getReservation } from './methods/getReservation'
import { listReservations } from './methods/listReservations'

export const reservationRouter = router({
	create: protectedProcedure
		.input(createReservationInputSchema)
		.mutation(async ({ input }) => await createReservation(input)),
	get: protectedProcedure
		.input(reservationIdInputSchema)
		.query(async ({ input }) => await getReservation(input)),
	list: protectedProcedure
		.input(getReservationsInputSchema)
		.query(async ({ input }) => await listReservations(input)),
	cancel: protectedProcedure
		.input(reservationIdInputSchema)
		.mutation(async ({ input }) => await cancelReservation(input)),
})
