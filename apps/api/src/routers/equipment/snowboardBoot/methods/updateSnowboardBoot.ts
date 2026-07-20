import type { UpdateSnowboardBootInput } from '../../../../schemas/snowboardBoot'
import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'

export const updateSnowboardBoot = async (input: UpdateSnowboardBootInput) => {
  const snowboardBoot = await prisma.snowboardBoot.findUnique({
    where: { id: input.id },
  })

  if (!snowboardBoot) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Snowboard boot not found',
    })
  }

  return await prisma.snowboardBoot.update({
    where: { id: input.id },
    data: input,
  })
}
