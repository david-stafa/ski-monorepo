import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { isItemAvailable } from '../../../routers/equipment/_shared/methods/findAvailable'
import type { CreateReservationInput } from '../../../schemas/reservation'

export const createReservation = async (data: CreateReservationInput) => {
  return await prisma.$transaction(async (tx) => {
    for (const { items } of data.people) {
      for (const item of items) {
        const isAvailable = await isItemAvailable(
          {
            id: item.equipmentItemId,
            startDate: data.startDate,
            endDate: data.endDate,
          },
          tx
        )
        if (!isAvailable) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Item ${item.equipmentItemId} is already booked`,
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

    for (const { items, ...person } of data.people) {
      await tx.person.create({
        data: {
          ...person,
          reservation: { connect: { id: reservation.id } },
          reservationItems: {
            create: items.map((item) => ({
              startDate: reservation.startDate,
              endDate: reservation.endDate,
              reservation: { connect: { id: reservation.id } },
              equipmentItem: { connect: { id: item.equipmentItemId } },
            })),
          },
        },
      })
    }

    return { reservation: { id: reservation.id } }
  })
}
