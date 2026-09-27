import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { lockReservation, recomputeRolledUpStatus } from '../../../lib/recomputeRolledUpStatus'

export const cancelPerson = async ({ id }: { id: string }) => {
	return await prisma.$transaction(async (tx) => {
		const person = await tx.person.findUnique({
			where: {
				id,
			},
		})

		if (!person) throw new TRPCError({ code: 'NOT_FOUND', message: 'Osoba nebyla nalezena' })

		// Cancelled is final, and a repeat (double click, retry) must not move the
		// date they were cancelled on.
		if (person.status === 'CANCELLED') return person

		await lockReservation(tx, person.reservationId)
		const cancelled = await tx.person.update({
			where: { id },
			data: {
				status: 'CANCELLED',
				cancelledAt: new Date(),
				reservationItems: {
					updateMany: {
						// already-cancelled items keep the date they were cancelled on
						where: { status: { not: 'CANCELLED' } },
						data: {
							status: 'CANCELLED',
							cancelledAt: new Date(),
						},
					},
				},
			},
		})

		// The person no longer counts towards the reservation's status: if they
		// were the one holding it back, it moves on. (A Cancelled person's own
		// status is never recomputed.)
		await recomputeRolledUpStatus(tx, { personId: null, reservationId: person.reservationId })
		return cancelled
	})
}
