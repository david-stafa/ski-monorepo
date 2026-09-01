import {
	createSnowboardInputSchema,
	getSnowboardInputSchema,
	updateSnowboardInputSchema,
} from '../../../schemas/snowboard'
import { protectedProcedure, router } from '../../_context'
import { createSnowboard } from './methods/createSnowboard'
import { listSnowboards } from './methods/listSnowboards'
import { updateSnowboard } from './methods/updateSnowboard'

export const snowboardRouter = router({
	list: protectedProcedure.input(getSnowboardInputSchema).query(async ({ input }) => {
		return await listSnowboards(input)
	}),
	create: protectedProcedure.input(createSnowboardInputSchema).mutation(async ({ input }) => {
		return await createSnowboard(input)
	}),
	update: protectedProcedure.input(updateSnowboardInputSchema).mutation(async ({ input }) => {
		return await updateSnowboard(input)
	}),
})
