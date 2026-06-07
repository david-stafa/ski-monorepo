import type { UpdateSnowboardInput } from '../../../../schemas/snowboard'
import { prisma } from '@ski-blazek/db'

export const updateSnowboard = async (input: UpdateSnowboardInput) => {
  const snowboard = await prisma.snowboard.findUnique({
    where: { id: input.id },
  })

  if (!snowboard) {
    throw new Error('Snowboard not found')
  }

  return await prisma.snowboard.update({
    where: { id: input.id },
    data: input,
  })
}
