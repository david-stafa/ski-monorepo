import { prisma } from '@ski-blazek/db'
import type { CreateSkiInput } from '../../schemas/skiSchema'

export const getSki = async () => {
  const ski = await prisma.ski.findMany({
    where: {},
    select: {
      id: true,
      brand: true,
      model: true,
      length: true,
      isVIP: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return ski
}

export const createSki = async (input: CreateSkiInput) =>
  await prisma.ski.create({
    data: {
      ...input,
    },
  })

export const deleteSki = async (id: string) =>
  await prisma.ski.delete({
    where: { id },
  })
