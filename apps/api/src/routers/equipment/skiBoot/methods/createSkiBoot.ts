import { prisma } from '@ski-blazek/db'
import type { CreateSkiBootInput } from '../../../../schemas/skiBoot'
import {
  articleGroupForBootLength,
  asArticleNumberConflict,
  assignLowestFreeNumber,
} from '../../_shared/lib/assignArticleNumber'

export const createSkiBoot = async (input: CreateSkiBootInput) => {
  const articleGroup = articleGroupForBootLength(input.length)

  try {
    return await prisma.skiBoot.create({
      data: {
        ...input,
        equipmentItem: {
          create: {
            type: 'SKI_BOOT',
            articleGroup,
            articleNumber: await assignLowestFreeNumber(
              prisma,
              'SKI_BOOT',
              articleGroup
            ),
          },
        },
      },
      include: { equipmentItem: true },
    })
  } catch (error) {
    throw asArticleNumberConflict(error)
  }
}
