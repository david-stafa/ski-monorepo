import type { SnowboardBoot } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { paginationSchema } from './pagination'

/** create = the editable fields. Single home for validation rules. */
export const createSnowboardBootInputSchema = z.object({
  brand: z.string().min(2),
  model: z.string().min(2),
  length: z.number().int().min(10),
  isBoa: z.boolean(),
}) satisfies z.ZodType<Omit<SnowboardBoot, 'id' | 'createdAt' | 'updatedAt'>>
export type CreateSnowboardBootInput = z.infer<
  typeof createSnowboardBootInputSchema
>

/** update = create + id */
export const updateSnowboardBootInputSchema =
  createSnowboardBootInputSchema.extend({
    id: z.string(),
  })
export type UpdateSnowboardBootInput = z.infer<
  typeof updateSnowboardBootInputSchema
>

/** list query (search / sort / pagination) */
export const getSnowboardBootInputSchema = paginationSchema.extend({
  search: z.string().optional(),
  orderBy: z.enum(['length', 'brand', 'model', 'isBoa']).default('length'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
})
export type GetSnowboardBootInput = z.infer<typeof getSnowboardBootInputSchema>
