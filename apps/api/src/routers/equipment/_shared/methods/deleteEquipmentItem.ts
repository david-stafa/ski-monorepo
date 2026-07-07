import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import type { DeleteEquipmenInput } from '../../../../schemas/equipmentItem'

export const deleteEquipmentItem = async ({ id }: DeleteEquipmenInput) => {
  // Find item with all reservations
  const item = await prisma.equipmentItem.findUnique({
    where: { id },
    include: { _count: { select: { reservationItems: true } } },
  })

  if (!item) throw new TRPCError({ code: 'NOT_FOUND' })

  // If there are any reservations binded to the item -> return an error
  if (item._count.reservationItems > 0) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'This item has bookings — retire it instead of deleting.',
    })
  }

  // If there are no reservations on this item -> Delete
  return prisma.equipmentItem.delete({ where: { id } })
}
