import z from 'zod'
import { statusStepInputSchema } from '../../schemas/statusStep'
import { protectedProcedure, router } from '../_context'
import { advancePerson } from './methods/advancePerson'
import { cancelPerson } from './methods/cancelPerson'

export const personRouter = router({
	cancel: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => await cancelPerson(input)),
	advance: protectedProcedure
		.input(statusStepInputSchema)
		.mutation(async ({ input }) => await advancePerson(input)),
})
