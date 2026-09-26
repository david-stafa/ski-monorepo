/*
    The Season: the shop's year, 1 May – 30 April (see CONTEXT.md). Shared by
    the stock check and seasonal reservations, and by the API and the web app.
 */

/**
 * The season rolls over on 1 May (zero-based month). Change this one
 * constant and both the "checked this year" highlight and the sweep follow.
 */
const SEASON_START_MONTH = 4

/**
 * Start of the season `at` falls in. A check recorded on or after this counts
 * as current; anything older is last season's and the sweep will pick it up.
 *
 * Deliberately not `now - 1 year`: a rolling window gives a different answer
 * depending on the hour you click, and drifts if a check spans New Year.
 */
export const seasonStart = (at: Date = new Date()) => {
	const year = at.getMonth() >= SEASON_START_MONTH ? at.getFullYear() : at.getFullYear() - 1

	return new Date(year, SEASON_START_MONTH, 1)
}

/**
 * When seasonal gear is due back: 31 March (zero-based month) of the season.
 * A code constant until the shop settles on its real date — MY-68 moves it
 * into a settings page.
 */
const SEASON_RETURN_DEADLINE = { month: 2, day: 31 }

/**
 * End of the return-deadline day in the season `at` falls in — the end date a
 * seasonal reservation starting at `at` gets. Returned as end of day, matching
 * how the date range picker stores every other end date.
 */
export const seasonReturnDeadline = (at: Date) =>
	new Date(
		seasonStart(at).getFullYear() + 1,
		SEASON_RETURN_DEADLINE.month,
		SEASON_RETURN_DEADLINE.day,
		23,
		59,
		59,
		999
	)
