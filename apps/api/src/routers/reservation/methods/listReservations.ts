import { prisma } from '@ski-blazek/db'
import type { Prisma } from '@ski-blazek/db/browser'
import type { GetReservationsInput } from '../../../schemas/reservation'

export const listReservations = async ({
  orderBy,
  orderDirection,
  page,
  itemsPerPage,
  search,
  status,
  from,
  to,
  dateMode,
}: GetReservationsInput) => {
  const dateWhere: Prisma.ReservationWhereInput =
    !from || !to
      ? {}
      : dateMode === 'PICKUP'
        ? { startDate: { gte: from, lt: to } } // hands gear out this week
        : dateMode === 'RETURN'
          ? { endDate: { gte: from, lt: to } } // takes gear back this week
          : { startDate: { lt: to }, endDate: { gt: from } } // out at any point this week

  const where: Prisma.ReservationWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status }),
    ...(dateWhere && dateWhere),
  }

  const [reservations, totalCount] = await prisma.$transaction([
    prisma.reservation.findMany({
      where,
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        note: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        _count: { select: { people: true, reservationItems: true } },
      },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      orderBy: { [orderBy]: orderDirection },
    }),

    prisma.reservation.count({ where }),
  ])

  return { reservations, totalCount }
}
