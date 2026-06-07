import { prisma } from '@ski-blazek/db'
import type { CreateSkiInput, GetSkiInput } from '../../../../../schemas/ski'
import type { UpdateSkiInput } from '../../schemas/skiSchema'

export const getSki = async ({
  page,
  itemsPerPage,
  orderBy,
  orderDirection,
  search,
}: GetSkiInput) => {
  const where = search
    ? {
        OR: [
          { brand: { contains: search, mode: 'insensitive' as const } },
          { model: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}
    
  const ski = await prisma.ski.findMany({
    where,
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
    orderBy: [
      {
        [orderBy]: orderDirection,
      },
      {
        brand: 'asc',
      },
    ],
  })

  const totalCount = await prisma.ski.count({
    where,
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

export const updateSki = async (input: UpdateSkiInput) => {
  const ski = await prisma.ski.findUnique({
    where: { id: input.id },
  })

  if (!ski) {
    throw new Error('Ski not found')
  }

  await prisma.ski.update({
    where: { id: input.id },
    data: input,
  })

  return {
    success: true,
  }
}
