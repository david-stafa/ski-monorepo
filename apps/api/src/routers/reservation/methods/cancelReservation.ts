import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { lockReservation } from '../../../lib/recomputeRolledUpStatus'
import { canCancel } from '../../../lib/statusFlow'
import type { ReservationIdInput } from '../../../schemas/reservation'

export const cancelReservation = async ({ id }: ReservationIdInput) => {
	return await prisma.$transaction(async (tx) => {
		// Lock before reading, so nobody can hand gear out between the check
		// below and the cancel.
		await lockReservation(tx, id)
		const reservation = await tx.reservation.findUnique({ where: { id } })

		if (!reservation)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Rezervace nebyla nalezena',
			})

		// Cancelled is final, and a repeat (double click, retry) must not move the
		// date it was cancelled on.
		if (reservation.status === 'CANCELLED') return reservation

		// Once gear has left the shop, it can only end as Returned. People count
		// too: an accessories-only person has no items to show they've picked up.
		const people = await tx.person.findMany({
			where: { reservationId: id },
			select: { status: true },
		})
		const items = await tx.reservationItem.findMany({
			where: { reservationId: id },
			select: { status: true },
		})
		const statuses = [...people, ...items].map((child) => child.status)
		if (!canCancel(reservation.status, statuses))
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'Vybavení už bylo vydáno, rezervaci nelze zrušit',
			})

		// No roll-up afterwards: it never touches a Cancelled reservation, and
		// every person on it is Cancelled now too.
		return await tx.reservation.update({
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
	})
}
