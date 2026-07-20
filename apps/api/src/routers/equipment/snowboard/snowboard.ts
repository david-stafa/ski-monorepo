import { publicProcedure, router } from '../../_context'
import {
  createSnowboardInputSchema,
  getSnowboardInputSchema,
  updateSnowboardInputSchema,
} from '../../../schemas/snowboard'
import { listSnowboards } from './methods/listSnowboards'
import { createSnowboard } from './methods/createSnowboard'
import { updateSnowboard } from './methods/updateSnowboard'

export const snowboardRouter = router({
  list: publicProcedure
    .input(getSnowboardInputSchema)
    .query(async ({ input }) => {
      return await listSnowboards(input)
    }),
  create: publicProcedure
    .input(createSnowboardInputSchema)
    .mutation(async ({ input }) => {
      return await createSnowboard(input)
    }),
  update: publicProcedure
    .input(updateSnowboardInputSchema)
    .mutation(async ({ input }) => {
      return await updateSnowboard(input)
    }),
})
