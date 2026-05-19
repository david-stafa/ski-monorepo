import { prisma } from '@ski-blazek/db'
import type { CreateSkiInput } from '../../schemas/skiSchema'

type GetSkiInput = {
  page: number
  itemsPerPage: number
}

export const getSki = async ({ page, itemsPerPage }: GetSkiInput) => {
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
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
  })

  const totalCount = await prisma.ski.count({
    where: {},
  })

  return {
    ski,
    totalCount,
  }
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
