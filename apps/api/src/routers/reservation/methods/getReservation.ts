import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import type {
  ReservationIdInput
} from '../../../schemas/reservation'

export const getReservation = async ({ id }: ReservationIdInput) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      // Detail view = the full tree: reservation -> people -> their items -> the gear itself.
      people: {
        include: {
          reservationItems: {
            include: {
              equipmentItem: {
                include: {
                  ski: true,
                  skiBoot: true,
                  snowboard: true,
                  snowboardBoot: true,
                  helmet: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!reservation) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Reservation ${id} not found`,
    })
  }

  return reservation
}
