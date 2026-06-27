import { prisma } from '@ski-blazek/db'
import type { GetSnowboardInput } from '../../../../schemas/snowboard'
import type { Prisma } from '@ski-blazek/db/browser'

export const getSnowboards = async ({
  page,
  itemsPerPage,
  orderBy,
  orderDirection,
  search,
}: GetSnowboardInput) => {
  const where: Prisma.SnowboardWhereInput = search
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

  const [snowboards, totalCount] = await prisma.$transaction([
    prisma.snowboard.findMany({
      where,
      select: {
        id: true,
        brand: true,
        model: true,
        length: true,
      },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      orderBy: [
        {
          [orderBy]: orderDirection,
        },
      ],
    }),

    prisma.snowboard.count({
      where,
    }),
  ])

  return {
    snowboards,
    totalCount,
  }
}
