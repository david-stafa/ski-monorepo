import {
	createSkiBootInputSchema,
	getSkiBootInputSchema,
	updateSkiBootInputSchema,
} from '../../../schemas/skiBoot'
import { protectedProcedure, router } from '../../_context'
import { createSkiBoot } from './methods/createSkiBoot'
import { listSkiBoots } from './methods/listSkiBoots'
import { updateSkiBoot } from './methods/updateSkiBoot'

export const skiBootRouter = router({
	list: protectedProcedure.input(getSkiBootInputSchema).query(async ({ input }) => {
		return await listSkiBoots(input)
	}),
	create: protectedProcedure.input(createSkiBootInputSchema).mutation(async ({ input }) => {
		return await createSkiBoot(input)
	}),
	update: protectedProcedure.input(updateSkiBootInputSchema).mutation(async ({ input }) => {
		return await updateSkiBoot(input)
	}),
})
