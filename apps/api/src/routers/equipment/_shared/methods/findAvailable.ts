import { Prisma, prisma } from '@ski-blazek/db'
import type {
  FindAvailableInput,
  IsItemAvailableInput,
} from '../../../../schemas/equipmentItem'

/**
 * A booking that occupies an item for the requested window: overlapping dates
 * (half-open — start < reqEnd AND end > reqStart) AND still active. Shared by
 * findAvailable + isItemAvailable so the "what counts as booked" rule lives in
 * one place and the two can't drift.
 */
const overlappingActiveBooking = (
  reqStart: Date,
  reqEnd: Date
): Prisma.ReservationItemWhereInput => ({
  startDate: { lt: reqEnd },
  endDate: { gt: reqStart },
  status: 'ACTIVE',
})

export const findAvailable = async ({
  type,
  startDate: reqStart,
  endDate: reqEnd,
}: FindAvailableInput) => {
  const availableItems = await prisma.equipmentItem.findMany({
    where: {
      type,
      retiredAt: null,
      // available = no overlapping active booking exists
      reservationItems: { none: overlappingActiveBooking(reqStart, reqEnd) },
    },
    include: {
      ski: true,
      skiBoot: true,
      snowboard: true,
      snowboardBoot: true,
      helmet: true,
    },
    orderBy: {
      articleNumber: 'asc',
    },
  })

  return availableItems
}

export const isItemAvailable = async (
  { id, startDate: reqStart, endDate: reqEnd }: IsItemAvailableInput,
  prismaClient: Prisma.TransactionClient = prisma // defaults to the global client
) => {
  const availableItem = await prismaClient.equipmentItem.findUnique({
    where: {
      id,
      retiredAt: null,
      reservationItems: { none: overlappingActiveBooking(reqStart, reqEnd) },
    },
  })

  return availableItem ? true : false
}
