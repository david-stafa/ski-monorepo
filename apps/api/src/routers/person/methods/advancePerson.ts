import { type Prisma, prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { lockReservation, recomputeRolledUpStatus } from '../../../lib/recomputeRolledUpStatus'
import { nextStatus, STEP_TIMESTAMP } from '../../../lib/statusFlow'
import type { StatusStepInput } from '../../../schemas/statusStep'

/**
 * Moves everything for one person one step: only the items at the person's
 * rolled-up status move, so items already further along are left alone and
 * nothing ever skips a step. The person then rolls up to the next status.
 *
 * A person with no items (renting only accessories, or whose gear was all
 * removed) has nothing to roll up from, so the person itself moves instead.
 */
export const advancePerson = async ({ id, from }: StatusStepInput) => {
	const to = nextStatus(from)
	if (!to)
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'Vrácenou ani zrušenou osobu nelze posunout dál',
		})

	const data: Prisma.ReservationItemUpdateManyMutationInput = { status: to }
	const timestamp = STEP_TIMESTAMP[to]
	if (timestamp) data[timestamp] = new Date()

	return await prisma.$transaction(async (tx) => {
		const found = await tx.person.findUnique({ where: { id } })
		if (!found) throw new TRPCError({ code: 'NOT_FOUND', message: 'Osoba nebyla nalezena' })
		await lockReservation(tx, found.reservationId)

		// Read again now that we hold the lock, so no item step can slip in
		// between this check and the update. If the person has moved since the
		// staff member saw them, either way, nothing changes.
		const person = await tx.person.findUniqueOrThrow({ where: { id } })
		if (person.status !== from)
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'Osobu mezitím změnil někdo jiný. Obnovte stránku a zkuste to znovu.',
			})

		const itemCount = await tx.reservationItem.count({
			where: { personId: id, status: { not: 'CANCELLED' } },
		})
		if (itemCount === 0) {
			await tx.person.update({ where: { id }, data: { status: to } })
		} else {
			await tx.reservationItem.updateMany({ where: { personId: id, status: from }, data })
		}

		await recomputeRolledUpStatus(tx, { personId: id, reservationId: person.reservationId })
		return await tx.person.findUniqueOrThrow({ where: { id } })
	})
}
