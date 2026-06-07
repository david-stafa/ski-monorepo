import { prisma } from '@ski-blazek/db'
import type { CreateHelmetInput } from '../../../../schemas/helmet'

export const createHelmet = async (input: CreateHelmetInput) => {
  return await prisma.helmet.create({
    data: {
      ...input,
    },
  })
}
