import {
	createSnowboardBootInputSchema,
	getSnowboardBootInputSchema,
	updateSnowboardBootInputSchema,
} from '../../../schemas/snowboardBoot'
import { protectedProcedure, router } from '../../_context'
import { createSnowboardBoot } from './methods/createSnowboardBoot'
import { listSnowboardBoots } from './methods/listSnowboardBoots'
import { updateSnowboardBoot } from './methods/updateSnowboardBoot'

export const snowboardBootRouter = router({
	list: protectedProcedure.input(getSnowboardBootInputSchema).query(async ({ input }) => {
		return await listSnowboardBoots(input)
	}),
	create: protectedProcedure.input(createSnowboardBootInputSchema).mutation(async ({ input }) => {
		return await createSnowboardBoot(input)
	}),
	update: protectedProcedure.input(updateSnowboardBootInputSchema).mutation(async ({ input }) => {
		return await updateSnowboardBoot(input)
	}),
})
