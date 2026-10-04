import { equipmentIdInputSchema, findAvailableInputSchema } from '../../../schemas/equipmentItem'
import { setCheckedInputSchema, stockSweepInputSchema } from '../../../schemas/stockCheck'
import { protectedProcedure, router } from '../../_context'
import { archiveUnchecked } from './methods/archiveUnchecked'
import { deleteEquipmentItem } from './methods/deleteEquipmentItem'
import { findAvailable } from './methods/findAvailable'
import { findReservations } from './methods/findReservations'
import { previewStockSweep } from './methods/previewStockSweep'
import { retireEquipmentItem } from './methods/retireEquipmentItem'
import { setChecked } from './methods/setChecked'
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
	findReservations: protectedProcedure
		.input(equipmentIdInputSchema)
		.query(async ({ input }) => await findReservations(input)),

	/*  Roční inventura  */
	setChecked: protectedProcedure.input(setCheckedInputSchema).mutation(async ({ input }) => {
		return await setChecked(input)
	}),
	previewStockSweep: protectedProcedure.input(stockSweepInputSchema).query(async ({ input }) => {
		return await previewStockSweep(input)
	}),
	archiveUnchecked: protectedProcedure.input(stockSweepInputSchema).mutation(async ({ input }) => {
		return await archiveUnchecked(input)
	}),
})
