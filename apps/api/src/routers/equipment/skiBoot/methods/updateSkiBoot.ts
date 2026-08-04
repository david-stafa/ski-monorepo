import type { UpdateSkiBootInput } from '../../../../schemas/skiBoot'
import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import {
  articleGroupForBootLength,
  asArticleNumberConflict,
  assignLowestFreeNumber,
} from '../../_shared/lib/assignArticleNumber'

export const updateSkiBoot = async ({ id, ...data }: UpdateSkiBootInput) => {
  const skiBoot = await prisma.skiBoot.findUnique({
    where: { id },
    select: { equipmentItem: { select: { articleGroup: true } } },
  })

  if (!skiBoot) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Ski boot not found' })
  }

  const articleGroup = articleGroupForBootLength(data.length)

  if (articleGroup === skiBoot.equipmentItem.articleGroup) {
    return await prisma.skiBoot.update({
      where: { id },
      data,
      include: { equipmentItem: true },
    })
  }

  // Re-sizing moves the boot to another sticker pool, where its old sequence
  // means nothing. It takes the lowest free number there and releases the old
  // one; the caller reads the new number off the response so staff can rewrite
  // the sticker.
  try {
    return await prisma.skiBoot.update({
      where: { id },
      data: {
        ...data,
        equipmentItem: {
          update: {
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
