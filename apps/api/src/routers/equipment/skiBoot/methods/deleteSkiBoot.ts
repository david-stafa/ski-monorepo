import { prisma } from '@ski-blazek/db'

export const deleteSkiBoot = async (id: string) => {
  return await prisma.skiBoot.delete({ where: { id } })
}
