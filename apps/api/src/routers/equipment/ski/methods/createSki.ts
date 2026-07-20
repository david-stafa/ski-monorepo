import { prisma } from '@ski-blazek/db'
import type { CreateSkiInput } from '../../../../schemas/ski'
import { assignLowestFreeNumber } from '../../_shared/lib/assignArticleNumber'

export const createSki = async (input: CreateSkiInput) =>
  await prisma.ski.create({
    data: {
      ...input,
      equipmentItem: {
        create: {
          type: 'SKI',
          articleNumber: await assignLowestFreeNumber(prisma, 'SKI'),
        },
      },
    },
    include: { equipmentItem: true },
  })
