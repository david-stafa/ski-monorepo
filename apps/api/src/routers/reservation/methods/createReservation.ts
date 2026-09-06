import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { isItemAvailable } from '../../../routers/equipment/_shared/methods/findAvailable'
import type { ReservationInput } from '../../../schemas/reservation'
import { personColumns } from './personColumns'

export const createReservation = async (data: ReservationInput) => {
	return await prisma.$transaction(async (tx) => {
		for (const { equipment } of data.people) {
			for (const equipmentItemId of Object.values(equipment)) {
				if (!equipmentItemId) continue

				const isAvailable = await isItemAvailable(
					{
						id: equipmentItemId,
						startDate: data.startDate,
						endDate: data.endDate,
					},
					tx
				)
				if (!isAvailable) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: `Item ${equipmentItemId} is already booked`,
					})
				}
			}
		}

		const reservation = await tx.reservation.create({
			data: {
				name: data.name,
				phoneNumber: data.phoneNumber,
				note: data.note,
				startDate: data.startDate,
				endDate: data.endDate,
			},
		})

		for (const person of data.people) {
			const assignedItemIds = Object.values(person.equipment).filter((id) => id !== null)

			await tx.person.create({
				data: {
					...personColumns(person),
					reservation: { connect: { id: reservation.id } },
					reservationItems: {
						create: assignedItemIds.map((equipmentItemId) => ({
							startDate: reservation.startDate,
							endDate: reservation.endDate,
							status: 'ACTIVE',
							reservation: { connect: { id: reservation.id } },
							equipmentItem: { connect: { id: equipmentItemId } },
						})),
					},
				},
			})
		}

		return { reservation: { id: reservation.id } }
	})
}
