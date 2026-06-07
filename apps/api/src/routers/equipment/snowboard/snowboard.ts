import z from 'zod'
import { publicProcedure, router } from '../../_context'
import { createSnowboardInputSchema } from '../../../schemas/snowboard'
import { getSnowboards } from './methods/getSnowboards'
import { createSnowboard } from './methods/createSnowboard'
import { deleteSnowboard } from './methods/deleteSnowboard'

export const snowboardRouter = router({
  getSnowboard: publicProcedure.query(async () => {
    return await getSnowboards()
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
})
