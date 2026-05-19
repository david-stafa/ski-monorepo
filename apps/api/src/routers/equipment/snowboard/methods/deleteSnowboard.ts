import { prisma } from '@ski-blazek/db'

export const deleteSnowboard = async (id: string) => {
  return await prisma.snowboard.delete({ where: { id } })
}
