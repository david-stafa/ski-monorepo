import { prisma } from '@ski-blazek/db'

export const deleteSnowboardBoot = async (id: string) => {
  return await prisma.snowboardBoot.delete({ where: { id } })
}
