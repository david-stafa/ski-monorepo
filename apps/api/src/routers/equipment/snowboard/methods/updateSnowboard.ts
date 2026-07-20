import type { UpdateSnowboardInput } from '../../../../schemas/snowboard'
import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'

export const updateSnowboard = async (input: UpdateSnowboardInput) => {
  const snowboard = await prisma.snowboard.findUnique({
    where: { id: input.id },
  })

  if (!snowboard) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Snowboard not found' })
  }

  return await prisma.snowboard.update({
    where: { id: input.id },
    data: input,
  })
}
