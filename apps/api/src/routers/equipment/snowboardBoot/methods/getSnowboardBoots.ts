import { prisma } from '@ski-blazek/db'

export const getSnowboardBoots = async () => {
  const snowboardBoots = await prisma.snowboardBoot.findMany({
    where: {},
    select: {
      id: true,
      brand: true,
      model: true,
      length: true,
      isBoa: true,
    },
  })
  return snowboardBoots
}
