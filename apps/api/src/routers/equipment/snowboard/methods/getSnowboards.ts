import { prisma } from '@ski-blazek/db'

export const getSnowboards = async () => {
  const snowboards = await prisma.snowboard.findMany({
    where: {},
    select: {
      id: true,
      brand: true,
      model: true,
      length: true,
    },
  })
  return snowboards
}
