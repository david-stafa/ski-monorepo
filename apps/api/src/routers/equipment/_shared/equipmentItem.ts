import {
  deleteEquipmentInputSchema,
  retireEquipmentInputSchema,
} from '../../../schemas/equipmentItem'
import { publicProcedure, router } from '../../_context'
import { retireEquipmentItem } from './methods/retireEquipmentItem'
import { deleteEquipmentItem } from './methods/deleteEquipmentItem'

export const equipmentItemRouter = router({
  retire: publicProcedure
    .input(retireEquipmentInputSchema)
    .mutation(async ({ input }) => {
      return await retireEquipmentItem(input)
    }),
  delete: publicProcedure
    .input(deleteEquipmentInputSchema)
    .mutation(async ({ input }) => {
      return await deleteEquipmentItem(input)
    }),
})
