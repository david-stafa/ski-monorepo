import { prisma } from '@ski-blazek/db'
import type { CreateSkiInput } from '../../../../schemas/ski'

export const createSki = async (input: CreateSkiInput) =>
  await prisma.ski.create({
    data: {
      ...input,
    },
  })
