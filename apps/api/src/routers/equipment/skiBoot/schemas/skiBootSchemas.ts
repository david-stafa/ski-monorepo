import type { SkiBoot } from '@ski-blazek/db'
import z from 'zod'

export type CreateSkiBootInput = Omit<SkiBoot, 'id' | 'createdAt' | 'updatedAt'>

export const createSkiBootInputSchema: z.ZodType<CreateSkiBootInput> = z.object(
  {
    brand: z.string(),
    model: z.string(),
    length: z.number().int(),
  },
)
