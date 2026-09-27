import { type Prisma, prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { lockReservation, recomputeRolledUpStatus } from '../../../lib/recomputeRolledUpStatus'
import { previousStatus, STEP_TIMESTAMP } from '../../../lib/statusFlow'
import type { ReservationItemStepInput } from '../../../schemas/reservationItem'

/** One step back, to undo a mistake. Clears the timestamp of the step it
 * leaves. */
export const undoReservationItem = async ({ id, from }: ReservationItemStepInput) => {
	const to = previousStatus(from)
	if (!to)
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'U rezervované ani zrušené položky není co vracet zpět',
		})

	const data: Prisma.ReservationItemUpdateManyMutationInput = { status: to }
	const timestamp = STEP_TIMESTAMP[from]
	if (timestamp) data[timestamp] = null

	return await prisma.$transaction(async (tx) => {
		const item = await tx.reservationItem.findUnique({ where: { id } })
		if (!item) throw new TRPCError({ code: 'NOT_FOUND', message: 'Položka nebyla nalezena' })
		await lockReservation(tx, item.reservationId)

		// Conditional on `from`: if the item has moved since the staff member saw
		// it, nothing matches and nothing changes.
		const { count } = await tx.reservationItem.updateMany({ where: { id, status: from }, data })
		if (count === 0)
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'Položku mezitím změnil někdo jiný. Obnovte stránku a zkuste to znovu.',
			})

		await recomputeRolledUpStatus(tx, item)
		return await tx.reservationItem.findUniqueOrThrow({ where: { id } })
	})
}
