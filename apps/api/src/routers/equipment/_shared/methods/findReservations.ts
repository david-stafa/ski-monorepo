import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import type { EquipmentIdInput } from '../../../../schemas/equipmentItem'

/**
 * One piece of gear with its bookings (cancelled ones left out), newest first. Every subtype
 * relation is included; only the one matching `type` is filled, the rest come
 * back null — the same shape findAvailable returns.
 */
export const findReservations = async ({ id }: EquipmentIdInput) => {
	const equipmentItem = await prisma.equipmentItem.findUnique({
		where: { id },
		include: { ski: true, skiBoot: true, snowboard: true, snowboardBoot: true, helmet: true },
	})

	if (!equipmentItem) throw new TRPCError({ code: 'NOT_FOUND', message: 'Vybavení nenalezeno' })

	const reservations = await prisma.reservationItem.findMany({
		where: {
			equipmentItemId: id,
			status: { not: 'CANCELLED' },
		},
		select: {
			id: true,
			startDate: true,
			endDate: true,
			status: true,
			reservation: {
				select: {
					id: true,
					name: true,
					phoneNumber: true,
				},
			},
		},
		orderBy: { startDate: 'desc' },
	})

	return { equipmentItem, reservations }
}
