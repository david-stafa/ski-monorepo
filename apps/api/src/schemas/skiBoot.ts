import type { SkiBoot } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { paginationSchema } from './pagination'

/** create = the editable fields. Single home for validation rules. */
export const createSkiBootInputSchema = z.object({
  brand: z.string().min(2),
  model: z.string().min(2),
  length: z.number().int().min(10),
}) satisfies z.ZodType<
  Omit<SkiBoot, 'id' | 'createdAt' | 'updatedAt' | 'equipmentItemId'>
>
export type CreateSkiBootInput = z.infer<typeof createSkiBootInputSchema>

/** update = create + id */
export const updateSkiBootInputSchema = createSkiBootInputSchema.extend({
  id: z.string(),
})
export type UpdateSkiBootInput = z.infer<typeof updateSkiBootInputSchema>

/** list query (search / sort / pagination) */
export const getSkiBootInputSchema = paginationSchema.extend({
  search: z.string().optional(),
  orderBy: z.enum(['length', 'brand', 'model']).default('length'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
})
export type GetSkiBootInput = z.infer<typeof getSkiBootInputSchema>
