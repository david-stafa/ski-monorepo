import { equipmentIdInputSchema, findAvailableInputSchema } from '../../../schemas/equipmentItem'
import { protectedProcedure, router } from '../../_context'
import { deleteEquipmentItem } from './methods/deleteEquipmentItem'
import { findAvailable } from './methods/findAvailable'
import { retireEquipmentItem } from './methods/retireEquipmentItem'
import { unretireEquipmentItem } from './methods/unretireEquipmentItem'

export const equipmentItemRouter = router({
	retire: protectedProcedure.input(equipmentIdInputSchema).mutation(async ({ input }) => {
		return await retireEquipmentItem(input)
	}),
	unretire: protectedProcedure.input(equipmentIdInputSchema).mutation(async ({ input }) => {
		return await unretireEquipmentItem(input)
	}),
	delete: protectedProcedure.input(equipmentIdInputSchema).mutation(async ({ input }) => {
		return await deleteEquipmentItem(input)
	}),
	findAvailable: protectedProcedure.input(findAvailableInputSchema).query(async ({ input }) => {
		return await findAvailable(input)
	}),
})
