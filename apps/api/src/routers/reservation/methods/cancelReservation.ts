import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import type { ReservationIdInput } from '../../../schemas/reservation'

export const cancelReservation = async ({ id }: ReservationIdInput) => {
	const reservation = await prisma.reservation.findUnique({
		where: { id },
	})

	if (!reservation)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Rezervace nebyla nalezena',
		})

	// Cancelled is final, and a repeat (double click, retry) must not move the
	// date it was cancelled on.
	if (reservation.status === 'CANCELLED') return reservation

	return await prisma.reservation.update({
		where: { id },
		data: {
			status: 'CANCELLED',
			cancelledAt: new Date(),
			// already-cancelled rows keep the date they were cancelled on
			people: {
				updateMany: {
					where: { status: { not: 'CANCELLED' } },
					data: { status: 'CANCELLED', cancelledAt: new Date() },
				},
			},
			reservationItems: {
				updateMany: {
					where: { status: { not: 'CANCELLED' } },
					data: { status: 'CANCELLED', cancelledAt: new Date() },
				},
			},
		},
	})
}
