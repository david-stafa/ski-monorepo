import { createSkiInputSchema, getSkiInputSchema, updateSkiInputSchema } from '../../../schemas/ski'
import { protectedProcedure, router } from '../../_context'
import { createSki } from './methods/createSki'
import { listSkis } from './methods/listSkis'
import { updateSki } from './methods/updateSki'

export const skiRouter = router({
	list: protectedProcedure.input(getSkiInputSchema).query(async ({ input }) => {
		return await listSkis(input)
	}),
	create: protectedProcedure.input(createSkiInputSchema).mutation(async ({ input }) => {
		return await createSki(input)
	}),
	update: protectedProcedure.input(updateSkiInputSchema).mutation(async ({ input }) => {
		return await updateSki(input)
	}),
})
