import z from 'zod'
import {
  createSkiInputSchema,
  getSkiInputSchema,
  updateSkiInputSchema,
} from '../../../schemas/ski'
import { publicProcedure, router } from '../../_context'
import { getSki } from './methods/getSki'
import { createSki } from './methods/createSki'
import { deleteSki } from './methods/deleteSki'
import { updateSki } from './methods/updateSki'

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
