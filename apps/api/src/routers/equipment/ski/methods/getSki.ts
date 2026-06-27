import { prisma } from '@ski-blazek/db'
import type { GetSkiInput } from '../../../../schemas/ski'

export const getSki = async ({
  page,
  itemsPerPage,
  orderBy,
  orderDirection,
  search,
}: GetSkiInput) => {
  const where = search
    ? {
        OR: [
          { brand: { contains: search, mode: 'insensitive' as const } },
          { model: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [ski, totalCount] = await prisma.$transaction([
    prisma.ski.findMany({
      where,
      select: {
        id: true,
        brand: true,
        model: true,
        length: true,
        isVIP: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      orderBy: [
        {
          [orderBy]: orderDirection,
        },
        {
          brand: 'asc',
        },
      ],
    }),

    prisma.ski.count({
      where,
    }),
  ])

  return {
    ski,
    totalCount,
  }
}
