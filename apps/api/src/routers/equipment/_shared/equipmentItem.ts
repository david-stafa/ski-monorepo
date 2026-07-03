import { retireEquipmentInputSchema } from '~/schemas/equipmentItem'
import { publicProcedure, router } from '../../_context'
import { retireEquipmentItem } from './methods/retireEquipmentItem'

export const equipmentItemRouter = router({
  retire: publicProcedure
    .input(retireEquipmentInputSchema)
    .mutation(async ({ input }) => {
      return await retireEquipmentItem(input)
    }),
})
