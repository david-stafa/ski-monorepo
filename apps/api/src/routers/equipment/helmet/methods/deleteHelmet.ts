import { prisma } from '@ski-blazek/db'

export const deleteHelmet = async (id: string) => {
  return await prisma.helmet.delete({ where: { id } })
}
