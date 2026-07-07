import { prisma } from '@ski-blazek/db'
import type { GetHelmetInput } from '../../../../schemas/helmet'

export const getHelmets = async ({
  page,
  itemsPerPage,
  orderBy,
  orderDirection,
  search,
}: GetHelmetInput) => {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { color: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [helmets, totalCount] = await prisma.$transaction([
    prisma.helmet.findMany({
      where,
      select: {
        id: true,
        name: true,
        size: true,
        color: true,
        description: true,
        withIntegratedGoggles: true,
        equipmentItemId: true,
      },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      orderBy: [
        {
          [orderBy]: orderDirection,
        },
      ],
    }),

    prisma.helmet.count({
      where,
    }),
  ])

  return {
    helmets,
    totalCount,
  }
}
