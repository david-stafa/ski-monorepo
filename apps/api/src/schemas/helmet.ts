import type { Helmet } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { paginationSchema } from './pagination'

/** create = the editable fields. Single home for validation rules. */
export const createHelmetInputSchema = z.object({
  name: z.string().min(2),
  size: z.string(),
  color: z.string(),
  description: z.string().nullable(),
  withIntegratedGoogles: z.boolean().default(false),
}) satisfies z.ZodType<Omit<Helmet, 'id' | 'createdAt' | 'updatedAt'>>
export type CreateHelmetInput = z.infer<typeof createHelmetInputSchema>

/** update = create + id */
export const updateHelmetInputSchema = createHelmetInputSchema.extend({
  id: z.string(),
})
export type UpdateHelmetInput = z.infer<typeof updateHelmetInputSchema>

/** list query (pagination) */
export const getHelmetInputSchema = paginationSchema.extend({})
export type GetHelmetInput = z.infer<typeof getHelmetInputSchema>
