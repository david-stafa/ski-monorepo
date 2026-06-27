import { prisma } from '@ski-blazek/db'
import type { GetSkiInput } from '../../../../schemas/ski'
import type { Prisma } from '@ski-blazek/db/browser'

export const getSki = async ({
  page,
  itemsPerPage,
  orderBy,
  orderDirection,
  search,
}: GetSkiInput) => {
  const where: Prisma.SkiWhereInput = search
    ? {
        OR: [
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          // TODO:: add this to other get equipment methods
          {
            length: {
              equals: isNaN(Number(search)) ? undefined : Number(search),
            },
          },
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
