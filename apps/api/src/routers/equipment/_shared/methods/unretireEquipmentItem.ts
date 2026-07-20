import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import type { EquipmentIdInput } from '../../../../schemas/equipmentItem'

export const unretireEquipmentItem = async ({ id }: EquipmentIdInput) => {
  const item = await prisma.equipmentItem.findUnique({
    where: {
      id,
    },
  })

  if (!item) throw new TRPCError({ code: 'NOT_FOUND' })

  return await prisma.equipmentItem.update({
    where: {
      id,
    },
    data: {
      retiredAt: null,
    },
  })
}
