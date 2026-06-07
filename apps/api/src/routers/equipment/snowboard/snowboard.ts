import z from 'zod'
import { publicProcedure, router } from '../../_context'
import {
  createSnowboardInputSchema,
  getSnowboardInputSchema,
  updateSnowboardInputSchema,
} from '../../../schemas/snowboard'
import { getSnowboards } from './methods/getSnowboards'
import { createSnowboard } from './methods/createSnowboard'
import { deleteSnowboard } from './methods/deleteSnowboard'
import { updateSnowboard } from './methods/updateSnowboard'

export const snowboardRouter = router({
  getSnowboard: publicProcedure
    .input(getSnowboardInputSchema)
    .query(async ({ input }) => {
      return await getSnowboards(input)
    }),
  createSnowboard: publicProcedure
    .input(createSnowboardInputSchema)
    .mutation(async ({ input }) => {
      return await createSnowboard(input)
    }),
  deleteSnowboard: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await deleteSnowboard(input)
    }),
  updateSnowboard: publicProcedure
    .input(updateSnowboardInputSchema)
    .mutation(async ({ input }) => {
      return await updateSnowboard(input)
    }),
})
