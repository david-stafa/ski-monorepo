import { prisma } from '@ski-blazek/db'
import type { RetireEquipmenInputSchema } from '~/schemas/equipmentItem'

export const retireEquipmentItem = async ({
  id,
}: RetireEquipmenInputSchema) => {
  await prisma.equipmentItem.update({
    where: {
      id,
    },
    data: {
      retiredAt: new Date(),
    },
  })
}
