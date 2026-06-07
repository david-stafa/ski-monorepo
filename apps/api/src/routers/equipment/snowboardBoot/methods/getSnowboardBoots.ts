import { prisma } from '@ski-blazek/db'
import type { GetSnowboardBootInput } from '../../../../schemas/snowboardBoot'

export const getSnowboardBoots = async ({
  page,
  itemsPerPage,
  orderBy,
  orderDirection,
  search,
}: GetSnowboardBootInput) => {
  const where = search
    ? {
        OR: [
          { brand: { contains: search, mode: 'insensitive' as const } },
          { model: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const snowboardBoots = await prisma.snowboardBoot.findMany({
    where,
    select: {
      id: true,
      brand: true,
      model: true,
      length: true,
      isBoa: true,
    },
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
    orderBy: [
      {
        [orderBy]: orderDirection,
      },
    ],
  })

  const totalCount = await prisma.snowboardBoot.count({
    where,
  })

  return {
    snowboardBoots,
    totalCount,
  }
}
