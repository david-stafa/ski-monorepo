import { prisma } from '@ski-blazek/db'
import type { CreateSnowboardBootInput } from '../../../../schemas/snowboardBoot'
import { assignLowestFreeNumber } from '../../_shared/lib/assignArticleNumber'

export const createSnowboardBoot = async (input: CreateSnowboardBootInput) => {
  await prisma.snowboardBoot.create({
    data: {
      ...input,
      equipmentItem: {
        create: {
          type: 'SNOWBOARD_BOOT',
          articleNumber: await assignLowestFreeNumber(prisma, 'SNOWBOARD_BOOT'),
        },
      },
    },
  })
}
