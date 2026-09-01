import z from 'zod'
import { protectedProcedure, router } from '../_context'
import { cancelPerson } from './methods/cancelPerson'

export const personRouter = router({
	cancel: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => await cancelPerson(input)),
})
