/**
 * Search and sort helpers shared by the equipment lists. Article numbers live
 * on `EquipmentItem`, so every list reaches them through the same relation
 * filter — keeping the parsing here is what stops the five list methods from
 * disagreeing about what `26.86` means.
 */

type SortOrder = 'asc' | 'desc'

/**
 * A length to match exactly, or `undefined` to skip the filter. For the `Int`
 * length columns — skis and snowboards — so whole numbers only: handing Prisma
 * a `165.5` for an `Int` field is a validation error, not an empty result.
 */
export const wholeNumberSearch = (search: string) =>
	/^\d+$/.test(search.trim()) ? Number(search.trim()) : undefined

/**
 * The same thing for the boots, whose `length` is a `Float`, so a half size is
 * searchable as itself: `26.5` finds the 26.5s. A comma works too — that is
 * what a Czech keyboard puts under the fingers.
 */
export const bootLengthSearch = (search: string) => {
	const trimmed = search.trim().replace(',', '.')

	return /^\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : undefined
}

/**
 * A sticker as staff type it: `26.86` for a boot, or a bare `86`. A bare number
 * deliberately matches the sequence in any pool — someone reading `86` off a
 * boot without noting the size still finds it.
 */
export const parseArticleSearch = (search: string) => {
	const trimmed = search.trim()

	const sticker = /^(\d+)\.(\d+)$/.exec(trimmed)

	if (sticker) {
		return {
			articleGroup: Number(sticker[1]),
			articleNumber: Number(sticker[2]),
		}
	}

	return /^\d+$/.test(trimmed) ? { articleNumber: Number(trimmed) } : null
}

/**
 * Spread into a list method's `OR`. Empty when the search isn't number-shaped,
 * so a text search stays a text search.
 */
export const articleNumberSearchFilter = (search: string) => {
	const parsed = parseArticleSearch(search)

	return parsed ? [{ equipmentItem: parsed }] : []
}

/**
 * Sticker order: pool first, then sequence within it, so size-26 boots list as
 * 26.1, 26.2, 26.10 rather than interleaving with the 27s. `articleGroup` is
 * always null for the types that carry a plain number, which makes the first
 * key a no-op for them.
 */
export const articleNumberOrderBy = (orderDirection: SortOrder) => [
	{ equipmentItem: { articleGroup: orderDirection } },
	{ equipmentItem: { articleNumber: orderDirection } },
]
