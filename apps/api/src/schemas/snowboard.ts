import type { Snowboard } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { paginationSchema } from './pagination'

/** create = the editable fields. Single home for validation rules. */
export const createSnowboardInputSchema = z.object({
  brand: z.string().min(2),
  model: z.string().min(2),
  length: z.number().int().min(50),
}) satisfies z.ZodType<Omit<Snowboard, 'id' | 'createdAt' | 'updatedAt'>>
export type CreateSnowboardInput = z.infer<typeof createSnowboardInputSchema>

/** update = create + id */
export const updateSnowboardInputSchema = createSnowboardInputSchema.extend({
  id: z.string(),
})
export type UpdateSnowboardInput = z.infer<typeof updateSnowboardInputSchema>

/** list query (search / sort / pagination) */
export const getSnowboardInputSchema = paginationSchema.extend({
  search: z.string().optional(),
  orderBy: z.enum(['length', 'brand', 'model']).default('length'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
})
export type GetSnowboardInput = z.infer<typeof getSnowboardInputSchema>
