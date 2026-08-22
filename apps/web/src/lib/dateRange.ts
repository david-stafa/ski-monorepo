import { addWeeks, endOfWeek, startOfWeek } from 'date-fns'
import { toDateString } from './format'

/** A `from`/`to` pair of `yyyy-MM-dd` strings, as the list inputs take them. */
export type DateRangeStrings = {
  from: string
  to: string
}

/**
 * A Mon–Sun week, `weekOffset` weeks from today. Resolved against the browser
 * clock on purpose: the week an admin means is the one they are standing in,
 * and defaulting this on the API would resolve it in the server's timezone
 * instead — a week boundary the shop never sees.
 */
export const getWeekRange = (weekOffset = 0): DateRangeStrings => {
  const day = addWeeks(new Date(), weekOffset)

  return {
    from: toDateString(startOfWeek(day, { weekStartsOn: 1 })),
    to: toDateString(endOfWeek(day, { weekStartsOn: 1 })),
  }
}

/** Today on both ends — a one-day window. */
export const getTodayRange = (): DateRangeStrings => {
  const today = toDateString(new Date())

  return { from: today, to: today }
}
