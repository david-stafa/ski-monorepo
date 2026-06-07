import { prisma } from '@ski-blazek/db'

export const deleteSki = async (id: string) =>
  await prisma.ski.delete({
    where: { id },
  })
