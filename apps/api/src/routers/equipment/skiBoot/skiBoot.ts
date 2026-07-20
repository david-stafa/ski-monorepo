import { publicProcedure, router } from '../../_context'
import { listSkiBoots } from './methods/listSkiBoots'
import { createSkiBoot } from './methods/createSkiBoot'
import {
  createSkiBootInputSchema,
  getSkiBootInputSchema,
  updateSkiBootInputSchema,
} from '../../../schemas/skiBoot'
import { updateSkiBoot } from './methods/updateSkiBoot'

export const skiBootRouter = router({
  list: publicProcedure.input(getSkiBootInputSchema).query(async ({ input }) => {
    return await listSkiBoots(input)
  }),
  create: publicProcedure
    .input(createSkiBootInputSchema)
    .mutation(async ({ input }) => {
      return await createSkiBoot(input)
    }),
  update: publicProcedure
    .input(updateSkiBootInputSchema)
    .mutation(async ({ input }) => {
      return await updateSkiBoot(input)
    }),
})
