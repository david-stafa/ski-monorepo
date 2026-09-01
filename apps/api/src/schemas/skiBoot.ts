import { Gender, type SkiBoot } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { paginationSchema } from './pagination'

/** create = the editable fields. Single home for validation rules. */
export const createSkiBootInputSchema = z.object({
	brand: z.string().min(2),
	model: z.string().min(2).nullable(),
	/**
	 * Mondopoint. Half sizes are real boots, thirds are not — `multipleOf(0.5)`
	 * is what keeps a stray 26.3 from reaching the column now that it is a Float.
	 */
	length: z.number().multipleOf(0.5).min(10),
	/** Stored as an English key, shown in Czech — see `colorOptions` on the web side. */
	color: z.string().nullable(),
	isKids: z.boolean(),
	gender: z.enum(Gender).nullable(),
}) satisfies z.ZodType<Omit<SkiBoot, 'id' | 'createdAt' | 'updatedAt' | 'equipmentItemId'>>
export type CreateSkiBootInput = z.infer<typeof createSkiBootInputSchema>

/** update = create + id */
export const updateSkiBootInputSchema = createSkiBootInputSchema.extend({
	id: z.string(),
})
export type UpdateSkiBootInput = z.infer<typeof updateSkiBootInputSchema>

/** list query (search / sort / pagination) */
export const getSkiBootInputSchema = paginationSchema.extend({
	search: z.string().optional(),
	orderBy: z
		.enum(['articleNumber', 'length', 'brand', 'model', 'color', 'gender'])
		.default('length'),
	orderDirection: z.enum(['asc', 'desc']).default('asc'),
})
export type GetSkiBootInput = z.infer<typeof getSkiBootInputSchema>
