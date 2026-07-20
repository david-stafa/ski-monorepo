import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import type { UpdateSkiInput } from '../../../../schemas/ski'

export const updateSki = async (input: UpdateSkiInput) => {
  const ski = await prisma.ski.findUnique({
    where: { id: input.id },
  })

  if (!ski) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Ski not found' })
  }

  await prisma.ski.update({
    where: { id: input.id },
    data: input,
  })

  return {
    success: true,
  }
}
