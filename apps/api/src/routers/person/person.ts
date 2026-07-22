import z from 'zod'
import { publicProcedure, router } from '../_context'
import { cancelPerson } from './methods/cancelPerson'

export const personRouter = router({
  cancel: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => await cancelPerson(input)),
})
