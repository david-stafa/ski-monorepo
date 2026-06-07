import type { UpdateSkiBootInput } from '../../../../schemas/skiBoot'
import { prisma } from '@ski-blazek/db'

export const updateSkiBoot = async (input: UpdateSkiBootInput) => {
  const skiBoot = await prisma.skiBoot.findUnique({
    where: { id: input.id },
  })

  if (!skiBoot) {
    throw new Error('Ski boot not found')
  }

  return await prisma.skiBoot.update({
    where: { id: input.id },
    data: input,
  })
}
