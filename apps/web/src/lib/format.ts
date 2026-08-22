import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

/**
 * Formats a date in the Czech locale as `d. M. yyyy`.
 *
 * @example
 * formatDate(new Date(2026, 7, 1)) // '1. 8. 2026'
 */
export const formatDate = (d: Date) => format(d, 'd. M. yyyy', { locale: cs })

/**
 * A calendar date as the plain `yyyy-MM-dd` string the API's `from` / `to`
 * inputs expect. Formatted in local time on purpose — `toISOString()` would
 * shift the day for anyone east or west of UTC.
 *
 * @example
 * toDateString(new Date(2026, 7, 1)) // '2026-08-01'
 */
export const toDateString = (d: Date) => format(d, 'yyyy-MM-dd')
