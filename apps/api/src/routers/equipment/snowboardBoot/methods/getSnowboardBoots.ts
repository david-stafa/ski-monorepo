import { prisma } from '@ski-blazek/db'
import type { GetSnowboardBootInput } from '../../../../schemas'

export const getSnowboardBoots = async ({
  page,
  itemsPerPage,
}: GetSnowboardBootInput) => {
  const snowboardBoots = await prisma.snowboardBoot.findMany({
    where: {},
    select: {
      id: true,
      brand: true,
      model: true,
      length: true,
      isBoa: true,
    },
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
  })

  const totalCount = await prisma.snowboardBoot.count({
    where: {},
  })

  return {
    snowboardBoots,
    totalCount,
  }
}
