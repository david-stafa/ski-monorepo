import { prisma } from '@ski-blazek/db'
import type { CreateSnowboardBootInput } from '../schemas/snowboardBootSchemas'

export const createSnowboardBoot = async (input: CreateSnowboardBootInput) => {
  return await prisma.snowboardBoot.create({
    data: {
      ...input,
    },
  })
}
