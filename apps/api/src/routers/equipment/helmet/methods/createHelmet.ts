import { prisma } from '@ski-blazek/db'
import type { CreateHelmetInput } from '../../../../schemas/helmet'
import { assignLowestFreeNumber } from '../../_shared/lib/assignArticleNumber'

export const createHelmet = async (input: CreateHelmetInput) => {
  return await prisma.helmet.create({
    data: {
      ...input,
      equipmentItem: {
        create: {
          type: 'HELMET',
          articleNumber: await assignLowestFreeNumber(prisma, 'HELMET'),
        },
      },
    },
    include: { equipmentItem: true },
  })
}
