import { prisma } from '@ski-blazek/db'

export const getHelmets = async () => {
  const helmets = await prisma.helmet.findMany({
    where: {},
    select: {
      id: true,
      name: true,
      size: true,
      color: true,
    },
  })
  return helmets
}
