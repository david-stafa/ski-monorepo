/**
 * Search and sort helpers shared by the equipment lists. Article numbers live
 * on `EquipmentItem`, so every list reaches them through the same relation
 * filter — keeping the parsing here is what stops the five list methods from
 * disagreeing about what `26.86` means.
 */

type SortOrder = 'asc' | 'desc'

/**
 * A length to match exactly, or `undefined` to skip the filter. Whole numbers
 * only: `Number('26.3')` is a perfectly good number, but the length columns are
 * `Int`, so Prisma truncates it to 26 and a search for the sticker `26.3` comes
 * back with the entire size-26 shelf.
 */
export const wholeNumberSearch = (search: string) =>
	/^\d+$/.test(search.trim()) ? Number(search.trim()) : undefined

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
