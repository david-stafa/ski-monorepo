import { publicProcedure, router } from '../../_context'
import { getSnowboardBoots } from './methods/getSnowboardBoots'
import { createSnowboardBoot } from './methods/createSnowboardBoot'
import { updateSnowboardBoot } from './methods/updateSnowboardBoot'
import {
  createSnowboardBootInputSchema,
  getSnowboardBootInputSchema,
  updateSnowboardBootInputSchema,
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
  updateSnowboardBoot: publicProcedure
    .input(updateSnowboardBootInputSchema)
    .mutation(async ({ input }) => {
      return await updateSnowboardBoot(input)
    }),
})
