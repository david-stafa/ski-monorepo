import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { lockReservation, recomputeRolledUpStatus } from '../../../lib/recomputeRolledUpStatus'
import { previousStatus } from '../../../lib/statusFlow'
import type { StatusStepInput } from '../../../schemas/statusStep'

/**
 * One step back for a person with no items (renting only accessories), whom
 * staff move by hand. A person with items is undone item by item instead: their
 * status is rolled up from the items, so there is nothing of their own to undo.
 */
export const undoPerson = async ({ id, from }: StatusStepInput) => {
	const to = previousStatus(from)
	if (!to)
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'U rezervované ani zrušené osoby není co vracet zpět',
		})

	return await prisma.$transaction(async (tx) => {
		const found = await tx.person.findUnique({ where: { id } })
		if (!found) throw new TRPCError({ code: 'NOT_FOUND', message: 'Osoba nebyla nalezena' })
		await lockReservation(tx, found.reservationId)

		// Read again now that we hold the lock. If the person has moved since the
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
		if (itemCount > 0)
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'Osoba má vybavení, vraťte zpět jednotlivé položky',
			})

		await tx.person.update({ where: { id }, data: { status: to } })
		await recomputeRolledUpStatus(tx, { personId: id, reservationId: person.reservationId })
		return await tx.person.findUniqueOrThrow({ where: { id } })
	})
}
