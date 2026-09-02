import { Gender, type Snowboard } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { paginationSchema } from './pagination'
import { stockCheckFilterSchema } from './stockCheck'

/** create = the editable fields. Single home for validation rules. */
export const createSnowboardInputSchema = z.object({
	brand: z.string().min(2),
	model: z.string().min(2).nullable(),
	length: z.number().int().min(50),
	gender: z.enum(Gender).nullable(),
}) satisfies z.ZodType<Omit<Snowboard, 'id' | 'createdAt' | 'updatedAt' | 'equipmentItemId'>>
export type CreateSnowboardInput = z.infer<typeof createSnowboardInputSchema>

/** update = create + id */
export const updateSnowboardInputSchema = createSnowboardInputSchema.extend({
	id: z.string(),
})
export type UpdateSnowboardInput = z.infer<typeof updateSnowboardInputSchema>

/** list query (search / sort / pagination) */
export const getSnowboardInputSchema = paginationSchema
	.extend({
		search: z.string().optional(),
		orderBy: z
			.enum(['articleNumber', 'length', 'brand', 'model', 'gender', 'lastCheckedAt'])
			.default('length'),
		orderDirection: z.enum(['asc', 'desc']).default('asc'),
	})
	.extend(stockCheckFilterSchema.shape)
export type GetSnowboardInput = z.infer<typeof getSnowboardInputSchema>
