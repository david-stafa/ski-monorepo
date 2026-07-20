import { prisma } from '@ski-blazek/db'
import type { CreateSnowboardInput } from '../../../../schemas/snowboard'
import { assignLowestFreeNumber } from '../../_shared/lib/assignArticleNumber'

export const createSnowboard = async (input: CreateSnowboardInput) => {
  return await prisma.snowboard.create({
    data: {
      ...input,
      equipmentItem: {
        create: {
          type: 'SNOWBOARD',
          articleNumber: await assignLowestFreeNumber(prisma, 'SNOWBOARD'),
        },
      },
    },
    include: { equipmentItem: true },
  })
}
