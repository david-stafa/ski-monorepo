import { publicProcedure, router } from '../../_context'
import { listSnowboardBoots } from './methods/listSnowboardBoots'
import { createSnowboardBoot } from './methods/createSnowboardBoot'
import { updateSnowboardBoot } from './methods/updateSnowboardBoot'
import {
  createSnowboardBootInputSchema,
  getSnowboardBootInputSchema,
  updateSnowboardBootInputSchema,
} from '../../../schemas/snowboardBoot'

export const snowboardBootRouter = router({
  list: publicProcedure
    .input(getSnowboardBootInputSchema)
    .query(async ({ input }) => {
      return await listSnowboardBoots(input)
    }),
  create: publicProcedure
    .input(createSnowboardBootInputSchema)
    .mutation(async ({ input }) => {
      return await createSnowboardBoot(input)
    }),
  update: publicProcedure
    .input(updateSnowboardBootInputSchema)
    .mutation(async ({ input }) => {
      return await updateSnowboardBoot(input)
    }),
})
