import z from 'zod'
import { publicProcedure, router } from '../../_context'
import {
  createHelmetInputSchema,
  getHelmetInputSchema,
  updateHelmetInputSchema,
} from '../../../schemas/helmet'
import { getHelmets } from './methods/getHelmets'
import { createHelmet } from './methods/createHelmet'
import { deleteHelmet } from './methods/deleteHelmet'
import { updateHelmet } from './methods/updateHelmet'

export const helmetRouter = router({
  getHelmet: publicProcedure
    .input(getHelmetInputSchema)
    .query(async ({ input }) => {
      return await getHelmets(input)
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
  updateHelmet: publicProcedure
    .input(updateHelmetInputSchema)
    .mutation(async ({ input }) => {
      return await updateHelmet(input)
    }),
})
