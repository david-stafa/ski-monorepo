import {
	getReservationsInputSchema,
	reservationIdInputSchema,
	reservationInputSchema,
	updateReservationInputSchema,
} from '../../schemas/reservation'
import { protectedProcedure, router } from '../_context'
import { cancelReservation } from './methods/cancelReservation'
import { createReservation } from './methods/createReservation'
import { getReservation } from './methods/getReservation'
import { getReservationForEdit } from './methods/getReservationForEdit'
import { listReservations } from './methods/listReservations'
import { updateReservation } from './methods/updateReservation'

export const reservationRouter = router({
	create: protectedProcedure
		.input(reservationInputSchema)
		.mutation(async ({ input }) => await createReservation(input)),
	get: protectedProcedure
		.input(reservationIdInputSchema)
		.query(async ({ input }) => await getReservation(input)),
	// the same reservation in the edit form's own shape — see getReservationForEdit
	getForEdit: protectedProcedure
		.input(reservationIdInputSchema)
		.query(async ({ input }) => await getReservationForEdit(input)),
	update: protectedProcedure
		.input(updateReservationInputSchema)
		.mutation(async ({ input }) => await updateReservation(input)),
	list: protectedProcedure
		.input(getReservationsInputSchema)
		.query(async ({ input }) => await listReservations(input)),
	cancel: protectedProcedure
		.input(reservationIdInputSchema)
		.mutation(async ({ input }) => await cancelReservation(input)),
})
