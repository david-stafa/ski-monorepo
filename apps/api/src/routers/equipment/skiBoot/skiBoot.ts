import {
	createSkiBootInputSchema,
	getSkiBootInputSchema,
	updateSkiBootInputSchema,
} from '../../../schemas/skiBoot'
import { publicProcedure, router } from '../../_context'
import { createSkiBoot } from './methods/createSkiBoot'
import { listSkiBoots } from './methods/listSkiBoots'
import { updateSkiBoot } from './methods/updateSkiBoot'

export const skiBootRouter = router({
	list: publicProcedure.input(getSkiBootInputSchema).query(async ({ input }) => {
		return await listSkiBoots(input)
	}),
	create: publicProcedure.input(createSkiBootInputSchema).mutation(async ({ input }) => {
		return await createSkiBoot(input)
	}),
	update: publicProcedure.input(updateSkiBootInputSchema).mutation(async ({ input }) => {
		return await updateSkiBoot(input)
	}),
})
