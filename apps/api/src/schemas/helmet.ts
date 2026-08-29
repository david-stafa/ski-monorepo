import { Gender, type Helmet } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { paginationSchema } from './pagination'

/** create = the editable fields. Single home for validation rules. */
export const createHelmetInputSchema = z.object({
	brand: z.string().min(2),
	model: z.string().nullable(),
	size: z.string(),
	color: z.string(),
	description: z.string().nullable(),
	withIntegratedGoggles: z.boolean(),
	gender: z.enum(Gender).nullable(),
}) satisfies z.ZodType<Omit<Helmet, 'id' | 'createdAt' | 'updatedAt' | 'equipmentItemId'>>
export type CreateHelmetInput = z.infer<typeof createHelmetInputSchema>

/** update = create + id */
export const updateHelmetInputSchema = createHelmetInputSchema.extend({
	id: z.string(),
})
export type UpdateHelmetInput = z.infer<typeof updateHelmetInputSchema>

/** list query (search / sort / pagination) */
export const getHelmetInputSchema = paginationSchema.extend({
	search: z.string().optional(),
	orderBy: z
		.enum(['articleNumber', 'brand', 'model', 'size', 'color', 'withIntegratedGoggles', 'gender'])
		.default('brand'),
	orderDirection: z.enum(['asc', 'desc']).default('asc'),
})
export type GetHelmetInput = z.infer<typeof getHelmetInputSchema>
