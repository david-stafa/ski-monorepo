import z from 'zod'
import { publicProcedure, router } from '../../_context'
import { createHelmetInputSchema } from '../../../schemas/helmet'
import { getHelmets } from './methods/getHelmets'
import { createHelmet } from './methods/createHelmet'
import { deleteHelmet } from './methods/deleteHelmet'

export const helmetRouter = router({
  getHelmet: publicProcedure.query(async () => {
    return await getHelmets()
  }),
  createHelmet: publicProcedure
    .input(createHelmetInputSchema)
    .mutation(async ({ input }) => {
      return await createHelmet(input)
    }),
  deleteHelmet: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await deleteHelmet(input)
    }),
})
