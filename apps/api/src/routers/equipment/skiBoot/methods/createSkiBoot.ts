import { prisma } from '@ski-blazek/db'
import type { CreateSkiBootInput } from '../schemas/skiBootSchemas'

export const createSkiBoot = async (input: CreateSkiBootInput) => {
  return await prisma.skiBoot.create({
    data: {
      ...input,
    },
  })
}
