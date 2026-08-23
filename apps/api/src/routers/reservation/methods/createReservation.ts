import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { isItemAvailable } from '../../../routers/equipment/_shared/methods/findAvailable'
import type { CreateReservationInput } from '../../../schemas/reservation'

export const createReservation = async (data: CreateReservationInput) => {
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

		for (const { equipment, ...person } of data.people) {
			await tx.person.create({
				data: {
					...person,
					reservation: { connect: { id: reservation.id } },
					reservationItems: {
						// TypeSafety does not work during development - during runtime prisma fails if there is wrong value passed
						// TODO: Find a way to add type safety in this snippet
						create: Object.values(equipment)
							.filter((equipmentItemId) => equipmentItemId !== null)
							.map((equipmentItemId) => ({
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
