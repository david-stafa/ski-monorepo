import { type Prisma, prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { lockReservation, recomputeRolledUpStatus } from '../../../lib/recomputeRolledUpStatus'
import { nextStatus, STEP_TIMESTAMP } from '../../../lib/statusFlow'
import type { StatusStepInput } from '../../../schemas/statusStep'

/**
 * Moves everything in a reservation one step: only the items at the
 * reservation's rolled-up status move, across all its people, so items already
 * further along are left alone and nothing ever skips a step. Each person and
 * then the reservation roll up afterwards.
 */
export const advanceReservation = async ({ id, from }: StatusStepInput) => {
	const to = nextStatus(from)
	if (!to)
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'Vrácenou ani zrušenou rezervaci nelze posunout dál',
		})

	const data: Prisma.ReservationItemUpdateManyMutationInput = { status: to }
	const timestamp = STEP_TIMESTAMP[to]
	if (timestamp) data[timestamp] = new Date()

	return await prisma.$transaction(async (tx) => {
		await lockReservation(tx, id)
		// Read after the lock, so no item step can slip in between this check
		// and the update.
		const reservation = await tx.reservation.findUnique({
			where: { id },
			include: { people: { select: { id: true } } },
		})
		if (!reservation)
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Rezervace nebyla nalezena' })
		// If it has moved since the staff member saw it, either way, nothing changes.
		if (reservation.status !== from)
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'Rezervaci mezitím změnil někdo jiný. Obnovte stránku a zkuste to znovu.',
			})

		const { count } = await tx.reservationItem.updateMany({
			where: { reservationId: id, status: from },
			data,
		})
		// Everyone left at this status rents only accessories (MY-74).
		if (count === 0)
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'Rezervace nemá žádné vybavení, které by šlo posunout',
			})

		// Each call also rolls the reservation up; the last one leaves it right.
		for (const person of reservation.people) {
			await recomputeRolledUpStatus(tx, { personId: person.id, reservationId: id })
		}
		return await tx.reservation.findUniqueOrThrow({ where: { id } })
	})
}
