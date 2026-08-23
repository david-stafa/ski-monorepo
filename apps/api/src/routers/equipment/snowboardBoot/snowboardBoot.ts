import {
	createSnowboardBootInputSchema,
	getSnowboardBootInputSchema,
	updateSnowboardBootInputSchema,
} from '../../../schemas/snowboardBoot'
import { publicProcedure, router } from '../../_context'
import { createSnowboardBoot } from './methods/createSnowboardBoot'
import { listSnowboardBoots } from './methods/listSnowboardBoots'
import { updateSnowboardBoot } from './methods/updateSnowboardBoot'

export const snowboardBootRouter = router({
	list: publicProcedure.input(getSnowboardBootInputSchema).query(async ({ input }) => {
		return await listSnowboardBoots(input)
	}),
	create: publicProcedure.input(createSnowboardBootInputSchema).mutation(async ({ input }) => {
		return await createSnowboardBoot(input)
	}),
	update: publicProcedure.input(updateSnowboardBootInputSchema).mutation(async ({ input }) => {
		return await updateSnowboardBoot(input)
	}),
})
