import { prisma } from '@ski-blazek/db'
import type { GetSkiBootInput } from '../../../../schemas/skiBoot'
import type { Prisma } from '@ski-blazek/db/browser'

export const listSkiBoots = async ({
  page,
  itemsPerPage,
  orderBy,
  orderDirection,
  search,
}: GetSkiBootInput) => {
  const where: Prisma.SkiBootWhereInput = search
    ? {
        OR: [
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          {
            length: {
              equals: isNaN(Number(search)) ? undefined : Number(search),
            },
          },
        ],
      }
    : {}

  const [skiBoots, totalCount] = await prisma.$transaction([
    prisma.skiBoot.findMany({
      where,
      select: {
        id: true,
        brand: true,
        model: true,
        length: true,
        equipmentItemId: true,
        equipmentItem: {
          select: {
            retiredAt: true,
            articleNumber: true,
          },
        },
      },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      orderBy: [
        {
          [orderBy]: orderDirection,
        },
      ],
    }),

    prisma.skiBoot.count({
      where,
    }),
  ])

  return {
    skiBoots,
    totalCount,
  }
}
