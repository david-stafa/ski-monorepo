import z from 'zod'
import { createSkiInputSchema, getSkiInputSchema } from '../../../schemas/ski'
import { publicProcedure, router } from '../../_context'
import { createSki, deleteSki, getSki, updateSki } from './methods/ski/ski'
import { updateSkiInputSchema } from './schemas/skiSchema'

export const skiRouter = router({
  getSki: publicProcedure.input(getSkiInputSchema).query(async ({ input }) => {
    return await getSki(input)
  }),
  createSki: publicProcedure
    .input(createSkiInputSchema)
    .mutation(async ({ input }) => {
      return await createSki(input)
    }),
  deleteSki: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    return await deleteSki(input)
  }),
  updateSki: publicProcedure
    .input(updateSkiInputSchema)
    .mutation(async ({ input }) => {
      return await updateSki(input)
    }),
})
