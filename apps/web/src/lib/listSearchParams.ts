import { stringifySearchWith } from '@tanstack/react-router'
import { z } from 'zod'

/**
 * Lists go into the URL as `statuses=BOOKED,PREPARED` rather than the router's
 * default of encoded JSON (`statuses=%5B%22BOOKED%22%2C...`), so they stay
 * readable. Everything else is written as the router always writes it.
 *
 * URLSearchParams escapes the commas too, so they are put back afterwards.
 * That is safe for every param: `,` and `%2C` read back as the same character.
 *
 * Read the list back with `listSearchParam` in the route's search schema.
 * @see https://tanstack.com/router/latest/docs/framework/react/guide/custom-search-param-serialization
 */
const stringifyWithCommaLists = stringifySearchWith(
	(value) => (Array.isArray(value) ? value.join(',') : JSON.stringify(value)),
	JSON.parse
)

export const stringifySearch = (search: Record<string, unknown>) =>
	stringifyWithCommaLists(search).replaceAll('%2C', ',')

/**
 * A list search param, written by `stringifySearch` above. From the URL it
 * arrives as one string — `'BOOKED,PREPARED'`, or `''` for an empty list —
 * so split it back up. A list set in code arrives as an array already.
 */
export const listSearchParam = <T extends z.ZodType>(item: T) =>
	z.preprocess(
		(value) => (typeof value === 'string' ? value.split(',').filter(Boolean) : value),
		z.array(item)
	)
