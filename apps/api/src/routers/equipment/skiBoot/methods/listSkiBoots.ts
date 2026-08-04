import { prisma } from '@ski-blazek/db'
import type { GetSkiBootInput } from '../../../../schemas/skiBoot'
import type { Prisma } from '@ski-blazek/db/browser'
import {
  articleNumberOrderBy,
  articleNumberSearchFilter,
  wholeNumberSearch,
} from '../../_shared/lib/equipmentListQuery'

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
          { length: { equals: wholeNumberSearch(search) } },
          ...articleNumberSearchFilter(search),
        ],
      }
    : {}

  const orderByClause: Prisma.SkiBootOrderByWithRelationInput[] =
    orderBy === 'articleNumber'
      ? articleNumberOrderBy(orderDirection)
      : [{ [orderBy]: orderDirection }]

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
            articleGroup: true,
            articleNumber: true,
          },
        },
      },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      orderBy: orderByClause,
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
