import type { Ski } from '@ski-blazek/db'
import { z } from 'zod'

/**
 * Shape your API accepts before Prisma adds id / timestamps.
 * Tied to the DB model so new columns surface as type errors here until Zod is updated.
 */
export type CreateSkiInput = Omit<Ski, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Parsed value must be assignable to SkiInsertBody (compile-time check).
 * Does not auto-generate fields from Prisma—you still list each key in `z.object`.
 */
export const createSkiInputSchema: z.ZodType<CreateSkiInput> = z.object({
  brand: z.string(),
  model: z.string(),
  length: z.number().int(),
  isVIP: z.boolean(),
})
