import { Prisma, prisma } from '@ski-blazek/db'
import type {
  FindAvailableInput,
  IsItemAvailableInput,
} from '../../../../schemas/equipmentItem'

export const findAvailable = async ({
  type,
  startDate: reqStart,
  endDate: reqEnd,
}: FindAvailableInput) => {
  const availableItems = await prisma.equipmentItem.findMany({
    where: {
      type,
      retiredAt: null,
      reservationItems: {
        // none meeans zero of those exists
        none: {
          startDate: { lt: reqEnd }, // start < reqEnd
          endDate: { gt: reqStart }, // end > reqStart   ← implicitly AND-ed
          person: {
            status: 'ACTIVE',
          },
        },
      },
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
      reservationItems: {
        // none meeans zero of those exists
        none: {
          startDate: { lt: reqEnd }, // start < reqEnd
          endDate: { gt: reqStart }, // end > reqStart   ← implicitly AND-ed
          person: {
            status: 'ACTIVE',
          },
        },
      },
    },
  })

  return availableItem ? true : false
}
