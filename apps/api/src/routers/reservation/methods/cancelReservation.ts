import { prisma } from '@ski-blazek/db'
import { type ReservationIdInput } from '../../../schemas/reservation'
import { TRPCError } from '@trpc/server'

export const cancelReservation = async ({ id }: ReservationIdInput) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
  })

  if (!reservation)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Rezervace nebyla nalezena',
    })

  return await prisma.reservation.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      people: {
        updateMany: { where: {}, data: { status: 'CANCELLED' } },
      },
      reservationItems: {
        updateMany: { where: {}, data: { status: 'CANCELLED' } },
      },
    },
  })
}
