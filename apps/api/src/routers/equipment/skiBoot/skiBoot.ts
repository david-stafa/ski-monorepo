import z from 'zod'
import { publicProcedure, router } from '../../_context'
import { getSkiBoots } from './methods/getSkiBoots'
import { createSkiBoot } from './methods/createSkiBoot'
import { deleteSkiBoot } from './methods/deleteSkiBoot'
import {
  createSkiBootInputSchema,
  getSkiBootInputSchema,
  updateSkiBootInputSchema,
} from '../../../schemas/skiBoot'
import { updateSkiBoot } from './methods/updateSkiBoot'

export const skiBootRouter = router({
  getSkiBoot: publicProcedure.input(getSkiBootInputSchema).query(async ({ input }) => {
    return await getSkiBoots(input)
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
  updateSkiBoot: publicProcedure
    .input(updateSkiBootInputSchema)
    .mutation(async ({ input }) => {
      return await updateSkiBoot(input)
    }),
})
