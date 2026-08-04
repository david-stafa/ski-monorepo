import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import type { EquipmentIdInput } from '../../../../schemas/equipmentItem'
import {
  asArticleNumberConflict,
  assignLowestFreeNumber,
} from '../lib/assignArticleNumber'

export const unretireEquipmentItem = async ({ id }: EquipmentIdInput) => {
  const item = await prisma.equipmentItem.findUnique({
    where: {
      id,
    },
  })

  if (!item) throw new TRPCError({ code: 'NOT_FOUND' })

  if (!item.retiredAt) return item

  // Retiring released this item's number back into its pool, so another item
  // may hold it by now. That is not a race to retry — the number is genuinely
  // someone else's — so the item comes back on the lowest free number instead,
  // needing a new sticker.
  const conflict = await prisma.equipmentItem.findFirst({
    where: {
      type: item.type,
      articleGroup: item.articleGroup,
      articleNumber: item.articleNumber,
      retiredAt: null,
    },
    select: { id: true },
  })

  try {
    return await prisma.equipmentItem.update({
      where: {
        id,
      },
      data: {
        retiredAt: null,
        articleNumber: conflict
          ? await assignLowestFreeNumber(prisma, item.type, item.articleGroup)
          : item.articleNumber,
      },
    })
  } catch (error) {
    throw asArticleNumberConflict(error)
  }
}
