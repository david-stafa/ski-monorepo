import z from 'zod'
import { publicProcedure, router } from '../../_context'
import { createSkiBootInputSchema } from './schemas/skiBootSchemas'
import { getSkiBoots } from './methods/getSkiBoots'
import { createSkiBoot } from './methods/createSkiBoot'
import { deleteSkiBoot } from './methods/deleteSkiBoot'

export const skiBootRouter = router({
  getSkiBoot: publicProcedure.query(async () => {
    return await getSkiBoots()
  }),
  createSkiBoot: publicProcedure
    .input(createSkiBootInputSchema)
    .mutation(async ({ input }) => {
      return await createSkiBoot(input)
    }),
  deleteSkiBoot: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await deleteSkiBoot(input)
    }),
})
