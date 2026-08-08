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
  // The input carries date-only strings, so widen them to cover the whole day
  // on both ends — otherwise a `to` of '2026-08-06' would cut off at midnight.
  // Anchored in UTC on purpose: a bare calendar date has no timezone, and
  // date-fns' startOfDay/endOfDay would resolve it in the API server's local
  // zone, silently shifting the window when the server isn't running in UTC.
  const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined
  const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined

  const dateWhere: Prisma.ReservationWhereInput =
    !fromDate || !toDate
      ? {}
      : dateMode === 'RETURN'
        ? { endDate: { gte: fromDate, lte: toDate } } // takes gear back this week
        : dateMode === 'ACTIVE'
          ? { startDate: { lte: toDate }, endDate: { gte: fromDate } } // out at any point this week
          : { startDate: { gte: fromDate, lte: toDate } } // PICKUP (default): hands gear out this week

  const where: Prisma.ReservationWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        // admins look people up by whoever is actually wearing the gear,
        // not only by whoever booked it
        {
          people: { some: { name: { contains: search, mode: 'insensitive' } } },
        },
      ],
    }),
    ...(status && { status }),
    ...dateWhere,
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
      // `startDate` ties are common, so add a stable tiebreak — without one
      // rows can jump between pages
      orderBy: [{ [orderBy]: orderDirection }, { createdAt: 'desc' }],
    }),

    prisma.reservation.count({ where }),
  ])

  return { reservations, totalCount }
}
