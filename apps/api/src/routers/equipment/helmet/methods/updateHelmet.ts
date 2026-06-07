import type { UpdateHelmetInput } from '../../../../schemas/helmet'
import { prisma } from '@ski-blazek/db'

export const updateHelmet = async (input: UpdateHelmetInput) => {
  const helmet = await prisma.helmet.findUnique({
    where: { id: input.id },
  })

  if (!helmet) {
    throw new Error('Helmet not found')
  }

  return await prisma.helmet.update({
    where: { id: input.id },
    data: input,
  })
}
