import { publicProcedure, router } from '../../_context'
import {
  createHelmetInputSchema,
  getHelmetInputSchema,
  updateHelmetInputSchema,
} from '../../../schemas/helmet'
import { listHelmets } from './methods/listHelmets'
import { createHelmet } from './methods/createHelmet'
import { updateHelmet } from './methods/updateHelmet'

export const helmetRouter = router({
  list: publicProcedure
    .input(getHelmetInputSchema)
    .query(async ({ input }) => {
      return await listHelmets(input)
    }),
  create: publicProcedure
    .input(createHelmetInputSchema)
    .mutation(async ({ input }) => {
      return await createHelmet(input)
    }),
  update: publicProcedure
    .input(updateHelmetInputSchema)
    .mutation(async ({ input }) => {
      return await updateHelmet(input)
    }),
})
