import { prisma } from '@ski-blazek/db'
import type { CreateSkiBootInput } from '../../../../schemas/skiBoot'
import { assignLowestFreeNumber } from '../../_shared/lib/assignArticleNumber'

export const createSkiBoot = async (input: CreateSkiBootInput) => {
  await prisma.skiBoot.create({
    data: {
      ...input,
      equipmentItem: {
        create: {
          type: 'SKI_BOOT',
          articleNumber: await assignLowestFreeNumber(prisma, 'SKI_BOOT'),
        },
      },
    },
  })
}
