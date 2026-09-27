import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { lockReservation, recomputeRolledUpStatus } from '../../../lib/recomputeRolledUpStatus'
import { canCancel } from '../../../lib/statusFlow'

export const cancelPerson = async ({ id }: { id: string }) => {
	return await prisma.$transaction(async (tx) => {
		const found = await tx.person.findUnique({ where: { id } })
		if (!found) throw new TRPCError({ code: 'NOT_FOUND', message: 'Osoba nebyla nalezena' })
		await lockReservation(tx, found.reservationId)

		// Read again now that we hold the lock, so nobody can hand gear out
		// between the check below and the cancel.
		const person = await tx.person.findUniqueOrThrow({ where: { id } })

		// Cancelled is final, and a repeat (double click, retry) must not move the
		// date they were cancelled on.
		if (person.status === 'CANCELLED') return person

		// Once gear has left the shop, it can only end as Returned.
		const items = await tx.reservationItem.findMany({
			where: { personId: id },
			select: { status: true },
		})
		if (
			!canCancel(
				person.status,
				items.map((item) => item.status)
			)
		)
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'Vybavení už bylo vydáno, osobu nelze zrušit',
			})

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
