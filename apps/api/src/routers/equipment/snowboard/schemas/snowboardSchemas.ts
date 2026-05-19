import type { Snowboard } from '@ski-blazek/db'
import z from 'zod'

export type CreateSnowboardInput = Omit<
  Snowboard,
  'id' | 'createdAt' | 'updatedAt'
>

export const createSnowboardInputSchema: z.ZodType<CreateSnowboardInput> =
  z.object({
    brand: z.string(),
    model: z.string(),
    length: z.number().int(),
  })
