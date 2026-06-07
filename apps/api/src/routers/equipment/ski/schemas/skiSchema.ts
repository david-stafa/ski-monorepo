import type { Ski } from '@ski-blazek/db'
import { z } from 'zod'
import { createSkiInputSchema } from '../../../../schemas/ski'

/**
 * Shape your API accepts before Prisma adds id / timestamps.
 * Tied to the DB model so new columns surface as type errors here until Zod is updated.
 */
export type UpdateSkiInput = Omit<Ski, 'createdAt' | 'updatedAt'>

/**
 * Parsed value must be assignable to SkiInsertBody (compile-time check).
 * Does not auto-generate fields from Prisma—you still list each key in `z.object`.
 */
export const updateSkiInputSchema = createSkiInputSchema.extend({
  id: z.string(),
}) satisfies z.ZodType<UpdateSkiInput>
