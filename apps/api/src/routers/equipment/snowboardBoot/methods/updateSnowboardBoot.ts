import type { UpdateSnowboardBootInput } from '../../../../schemas/snowboardBoot'
import { prisma } from '@ski-blazek/db'

export const updateSnowboardBoot = async (input: UpdateSnowboardBootInput) => {
  const snowboardBoot = await prisma.snowboardBoot.findUnique({
    where: { id: input.id },
  })

  if (!snowboardBoot) {
    throw new Error('Snowboard boot not found')
  }

  return await prisma.snowboardBoot.update({
    where: { id: input.id },
    data: input,
  })
}
