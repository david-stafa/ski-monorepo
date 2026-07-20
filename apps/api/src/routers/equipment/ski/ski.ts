import {
  createSkiInputSchema,
  getSkiInputSchema,
  updateSkiInputSchema,
} from '../../../schemas/ski'
import { publicProcedure, router } from '../../_context'
import { listSkis } from './methods/listSkis'
import { createSki } from './methods/createSki'
import { updateSki } from './methods/updateSki'

export const skiRouter = router({
  list: publicProcedure.input(getSkiInputSchema).query(async ({ input }) => {
    return await listSkis(input)
  }),
  create: publicProcedure
    .input(createSkiInputSchema)
    .mutation(async ({ input }) => {
      return await createSki(input)
    }),
  update: publicProcedure
    .input(updateSkiInputSchema)
    .mutation(async ({ input }) => {
      return await updateSki(input)
    }),
})
