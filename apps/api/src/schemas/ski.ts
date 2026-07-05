import type { Ski } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { paginationSchema } from './pagination'

/**
 * create = the editable fields. Single home for validation rules (shared by the
 * API procedure and the web form). `satisfies` keeps the schema aligned with the
 * Prisma model — a new/renamed column becomes a type error here — while
 * `z.infer` stays the source of truth for the input type.
 */
export const createSkiInputSchema = z.object({
  brand: z.string().min(2),
  model: z.string().min(2),
  length: z.number().int().min(50),
  isVIP: z.boolean(),
}) satisfies z.ZodType<
  Omit<Ski, 'id' | 'createdAt' | 'updatedAt' | 'equipmentItemId'>
>
export type CreateSkiInput = z.infer<typeof createSkiInputSchema>

/** update = create + id */
export const updateSkiInputSchema = createSkiInputSchema.extend({
  id: z.string(),
})
export type UpdateSkiInput = z.infer<typeof updateSkiInputSchema>

/** list query (search / sort / pagination) */
export const getSkiInputSchema = paginationSchema.extend({
  search: z.string().optional(),
  orderBy: z.enum(['length', 'brand', 'model', 'isVIP']).default('length'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
})
export type GetSkiInput = z.infer<typeof getSkiInputSchema>
