import { equipmentIdInputSchema } from '../../../schemas/equipmentItem'
import { publicProcedure, router } from '../../_context'
import { retireEquipmentItem } from './methods/retireEquipmentItem'
import { deleteEquipmentItem } from './methods/deleteEquipmentItem'
import { unretireEquipmentItem } from './methods/unretireEquipmentItem'

export const equipmentItemRouter = router({
  retire: publicProcedure
    .input(equipmentIdInputSchema)
    .mutation(async ({ input }) => {
      return await retireEquipmentItem(input)
    }),
  unretire: publicProcedure
    .input(equipmentIdInputSchema)
    .mutation(async ({ input }) => {
      return await unretireEquipmentItem(input)
    }),
  delete: publicProcedure
    .input(equipmentIdInputSchema)
    .mutation(async ({ input }) => {
      return await deleteEquipmentItem(input)
    }),
})
