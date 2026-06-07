import z from 'zod'
import { publicProcedure, router } from '../../_context'
import { getSnowboardBoots } from './methods/getSnowboardBoots'
import { createSnowboardBoot } from './methods/createSnowboardBoot'
import { deleteSnowboardBoot } from './methods/deleteSnowboardBoot'
import {
  createSnowboardBootInputSchema,
  getSnowboardBootInputSchema,
} from '../../../schemas/snowboardBoot'

export const snowboardBootRouter = router({
  getSnowboardBoot: publicProcedure
    .input(getSnowboardBootInputSchema)
    .query(async ({ input }) => {
      return await getSnowboardBoots(input)
    }),
  createSnowboardBoot: publicProcedure
    .input(createSnowboardBootInputSchema)
    .mutation(async ({ input }) => {
      return await createSnowboardBoot(input)
    }),
  deleteSnowboardBoot: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await deleteSnowboardBoot(input)
    }),
})
