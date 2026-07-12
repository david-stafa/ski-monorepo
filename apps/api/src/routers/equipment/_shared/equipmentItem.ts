import {
  equipmentIdInputSchema,
  findAvailableInputSchema,
} from '../../../schemas/equipmentItem'
import { publicProcedure, router } from '../../_context'
import { deleteEquipmentItem } from './methods/deleteEquipmentItem'
import { findAvailable } from './methods/findAvailable'
import { retireEquipmentItem } from './methods/retireEquipmentItem'
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
  findAvailable: publicProcedure
    .input(findAvailableInputSchema)
    .query(async ({ input }) => {
      return await findAvailable(input)
    }),
})
