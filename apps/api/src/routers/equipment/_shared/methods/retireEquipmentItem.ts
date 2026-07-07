import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import type { RetireEquipmenInput } from '../../../../schemas/equipmentItem'

export const retireEquipmentItem = async ({ id }: RetireEquipmenInput) => {
  const item = await prisma.equipmentItem.findFirst({
    where: {
      id,
    },
  })

  if (!item) throw new TRPCError({ code: 'NOT_FOUND' })

  await prisma.equipmentItem.update({
    where: {
      id,
    },
    data: {
      retiredAt: new Date(),
    },
  })
}
