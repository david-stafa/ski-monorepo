import { TRPCError } from '@trpc/server'
import { FITTING_API_KEY, FITTING_API_URL, IS_PRODUCTION } from '../../../config'
import {
	type FittingWeek,
	fittingWeekSchema,
	type GetFittingsInput,
} from '../../../schemas/fitting'
import { mockFittingWeek } from './mockFittingWeek'

/** The ski-reservation app is a separate deployment, so a slow or hung response
 * must not hold an Express worker open indefinitely. */
const TIMEOUT_MS = 5_000

/** Admins page back and forth through the weeks, so the same few weeks get asked
 * for repeatedly. Short enough that a booking made in the other app shows up
 * within the minute. */
const CACHE_TTL_MS = 60_000

const cache = new Map<string, { expiresAt: number; value: FittingWeek }>()

export const listWeeklyFittings = async ({ week }: GetFittingsInput) => {
	if (!FITTING_API_KEY) {
		if (!IS_PRODUCTION) return mockFittingWeek(week)

		throw new TRPCError({
			code: 'PRECONDITION_FAILED',
			message: 'FITTING_API_KEY is not configured.',
		})
	}

	const url = new URL('/api/reservations/weekly', FITTING_API_URL)
	if (week) url.searchParams.set('week', week)

	// An absent `week` means "current", which rolls over at midnight in the
	// upstream app's timezone — the TTL keeps that from going stale for long.
	const cacheKey = week ?? 'current'
	const cached = cache.get(cacheKey)
	if (cached && cached.expiresAt > Date.now()) return cached.value

	let response: Response
	try {
		response = await fetch(url, {
			headers: { 'x-api-key': FITTING_API_KEY },
			signal: AbortSignal.timeout(TIMEOUT_MS),
		})
	} catch (cause) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Rezervační systém je nedostupný.',
			cause,
		})
	}

	if (!response.ok) {
		// The upstream body can name the misconfigured key, so it is logged here
		// rather than forwarded to the client.
		console.error(`Fitting feed responded ${response.status}`, await response.text())

		throw new TRPCError({
			code: response.status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_SERVER_ERROR',
			message: 'Rezervace se nepodařilo načíst.',
		})
	}

	// Parsed, not cast: this crosses an app boundary, so a shape change upstream
	// should fail loudly here instead of surfacing as undefined in the UI.
	const value = fittingWeekSchema.parse(await response.json())

	cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value })
	// Only entries nobody asked for again can be dropped, so sweep the expired
	// ones here rather than letting the map grow for every week ever viewed.
	for (const [key, entry] of cache) {
		if (entry.expiresAt <= Date.now()) cache.delete(key)
	}

	return value
}
