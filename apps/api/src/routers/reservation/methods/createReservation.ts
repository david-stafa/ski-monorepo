import { prisma } from '@ski-blazek/db'
import type { CreateReservationInput } from '../../../schemas/reservation'

export const createReservation = async (data: CreateReservationInput) => {
  const reservation = await prisma.reservation.create({
    data: {
      name: data.name,
      phoneNumber: data.phoneNumber,
      note: data.note,
      startDate: data.startDate,
      endDate: data.endDate,
    },
  })

  for (const { items, ...person } of data.people) {
    await prisma.person.create({
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
}
