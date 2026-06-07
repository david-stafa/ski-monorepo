import { prisma } from '@ski-blazek/db'
import type { CreateSnowboardInput } from '../../../../schemas/snowboard'

export const createSnowboard = async (input: CreateSnowboardInput) => {
  return await prisma.snowboard.create({
    data: {
      ...input,
    },
  })
}
