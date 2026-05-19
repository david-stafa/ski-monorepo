import type { SnowboardBoot } from '@ski-blazek/db'
import z from 'zod'

export type CreateSnowboardBootInput = Omit<
  SnowboardBoot,
  'id' | 'createdAt' | 'updatedAt'
>

export const createSnowboardBootInputSchema: z.ZodType<CreateSnowboardBootInput> =
  z.object({
    brand: z.string(),
    model: z.string(),
    length: z.number().int(),
    isBoa: z.boolean().default(false),
  })
