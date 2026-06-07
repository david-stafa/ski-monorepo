import { prisma } from '@ski-blazek/db'
import type { UpdateSkiInput } from '../schemas/skiSchema'

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
