import type { UpdateHelmetInput } from '../../../../schemas/helmet'
import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'

export const updateHelmet = async (input: UpdateHelmetInput) => {
  const helmet = await prisma.helmet.findUnique({
    where: { id: input.id },
  })

  if (!helmet) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Helmet not found' })
  }

  return await prisma.helmet.update({
    where: { id: input.id },
    data: input,
  })
}
