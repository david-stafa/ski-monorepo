import {
	createHelmetInputSchema,
	getHelmetInputSchema,
	updateHelmetInputSchema,
} from '../../../schemas/helmet'
import { protectedProcedure, router } from '../../_context'
import { createHelmet } from './methods/createHelmet'
import { listHelmets } from './methods/listHelmets'
import { updateHelmet } from './methods/updateHelmet'

export const helmetRouter = router({
	list: protectedProcedure.input(getHelmetInputSchema).query(async ({ input }) => {
		return await listHelmets(input)
	}),
	create: protectedProcedure.input(createHelmetInputSchema).mutation(async ({ input }) => {
		return await createHelmet(input)
	}),
	update: protectedProcedure.input(updateHelmetInputSchema).mutation(async ({ input }) => {
		return await updateHelmet(input)
	}),
})
