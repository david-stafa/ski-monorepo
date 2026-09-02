import { Gender, type Helmet, HelmetSize } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { paginationSchema } from './pagination'
import { stockCheckFilterSchema } from './stockCheck'

/** The editable fields, before the cross-field rules below. */
const helmetFieldsSchema = z.object({
	brand: z.string().min(2),
	model: z.string().nullable(),
	size: z.enum(HelmetSize).nullable(),
	// an unmeasured helmet has both null, a measured one has both set
	circumferenceMin: z.number().int().min(30).max(80).nullable(),
	circumferenceMax: z.number().int().min(30).max(80).nullable(),
	color: z.string(),
	description: z.string().nullable(),
	withIntegratedGoggles: z.boolean(),
	gender: z.enum(Gender).nullable(),
}) satisfies z.ZodType<Omit<Helmet, 'id' | 'createdAt' | 'updatedAt' | 'equipmentItemId'>>

type HelmetFields = z.infer<typeof helmetFieldsSchema>

/**
 * `size` and the range describe the same physical property, so nothing but a
 * rule stops them disagreeing — an `M` saved as 61-63 would make the table say
 * one thing and search another. Keeping it here rather than in a DB constraint
 * is what lets the message land on the offending field in the form.
 */
const checkCircumference = (
	{ size, circumferenceMin, circumferenceMax }: HelmetFields,
	ctx: z.RefinementCtx
) => {
	// Not measured yet — the stocktaking case, and the only way to leave the
	// range empty. One value alone is a half-filled form, not a valid state.
	if (circumferenceMin === null && circumferenceMax === null) return

	if (circumferenceMin === null || circumferenceMax === null) {
		ctx.addIssue({
			code: 'custom',
			error: 'Invalid input',
			message: 'Vyplňte obě hodnoty obvodu, nebo žádnou',
			path: [circumferenceMin === null ? 'circumferenceMin' : 'circumferenceMax'],
		})
		return
	}

	if (circumferenceMin > circumferenceMax) {
		ctx.addIssue({
			code: 'custom',
			error: 'Invalid input',
			message: 'Maximální obvod musí být větší nebo roven minimálnímu',
			path: ['circumferenceMax'],
		})
		return
	}

	if (size === null) return

	// A letter is one size, so it is a point range; ADJUSTABLE is the label for
	// a shell that spans several, so it has to be a real one.
	if (size === 'ADJUSTABLE' && circumferenceMin === circumferenceMax) {
		ctx.addIssue({
			code: 'custom',
			error: 'Invalid input',
			message: 'Nastavitelná helma musí mít rozsah obvodu, ne jednu hodnotu',
			path: ['circumferenceMax'],
		})
		return
	}

	if (size !== 'ADJUSTABLE' && circumferenceMin !== circumferenceMax) {
		ctx.addIssue({
			code: 'custom',
			error: 'Invalid input',
			message: 'Pevná velikost má jeden obvod — pro rozsah zvolte velikost „Nastavitelná“',
			path: ['size'],
		})
	}
}

/** create = the editable fields. Single home for validation rules. */
export const createHelmetInputSchema = helmetFieldsSchema.superRefine(checkCircumference)
export type CreateHelmetInput = z.infer<typeof createHelmetInputSchema>

/**
 * update = create + id. Refined off the plain object rather than off
 * `createHelmetInputSchema`, because `.extend` is a `ZodObject` method and the
 * refinement is not one.
 */
export const updateHelmetInputSchema = helmetFieldsSchema
	.extend({ id: z.string() })
	.superRefine(checkCircumference)
export type UpdateHelmetInput = z.infer<typeof updateHelmetInputSchema>

/** list query (search / sort / pagination) */
export const getHelmetInputSchema = paginationSchema
	.extend({
		search: z.string().optional(),
		// Sorting by `size` sorts by the enum's declaration order, not
		// alphabetically — XS, S, M, L, XL, ADJUSTABLE, which is the order a person
		// would put them in anyway. That is why the enum is declared small-to-large.
		orderBy: z
			.enum([
				'articleNumber',
				'brand',
				'model',
				'size',
				'circumferenceMin',
				'color',
				'withIntegratedGoggles',
				'gender',
				'lastCheckedAt',
			])
			.default('articleNumber'),
		orderDirection: z.enum(['asc', 'desc']).default('asc'),
	})
	.extend(stockCheckFilterSchema.shape)
export type GetHelmetInput = z.infer<typeof getHelmetInputSchema>
