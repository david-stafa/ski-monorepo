import { Gender, type SnowboardBoot } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { paginationSchema } from './pagination'

/** create = the editable fields. Single home for validation rules. */
export const createSnowboardBootInputSchema = z.object({
	brand: z.string().min(2),
	model: z.string().min(2).nullable(),
	/** Mondopoint in half-size steps. See `createSkiBootInputSchema`. */
	length: z.number().multipleOf(0.5).min(10),
	isBoa: z.boolean(),
	gender: z.enum(Gender).nullable(),
}) satisfies z.ZodType<Omit<SnowboardBoot, 'id' | 'createdAt' | 'updatedAt' | 'equipmentItemId'>>
export type CreateSnowboardBootInput = z.infer<typeof createSnowboardBootInputSchema>

/** update = create + id */
export const updateSnowboardBootInputSchema = createSnowboardBootInputSchema.extend({
	id: z.string(),
})
export type UpdateSnowboardBootInput = z.infer<typeof updateSnowboardBootInputSchema>

/** list query (search / sort / pagination) */
export const getSnowboardBootInputSchema = paginationSchema.extend({
	search: z.string().optional(),
	orderBy: z
		.enum(['articleNumber', 'length', 'brand', 'model', 'isBoa', 'gender'])
		.default('length'),
	orderDirection: z.enum(['asc', 'desc']).default('asc'),
})
export type GetSnowboardBootInput = z.infer<typeof getSnowboardBootInputSchema>
