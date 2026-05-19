import { prisma } from '@ski-blazek/db'

export const getSkiBoots = async () => {
  const skiBoots = await prisma.skiBoot.findMany({
    where: {},
    select: {
      id: true,
      brand: true,
      model: true,
      length: true,
    },
  })
  return skiBoots
}
