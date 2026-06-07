import { prisma } from '@ski-blazek/db'
import type { GetSkiBootInput } from '../../../../schemas/skiBoot'

export const getSkiBoots = async ({
  page,
  itemsPerPage,
  orderBy,
  orderDirection,
  search,
}: GetSkiBootInput) => {
  const where = search
    ? {
        OR: [
          { brand: { contains: search, mode: 'insensitive' as const } },
          { model: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const skiBoots = await prisma.skiBoot.findMany({
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
  })

  const totalCount = await prisma.skiBoot.count({
    where,
  })

  return {
    skiBoots,
    totalCount,
  }
}
