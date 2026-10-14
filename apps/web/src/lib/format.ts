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
 * A from–to range with short Czech weekdays. The year is written once, at the
 * end, unless the range crosses New Year.
 *
 * @example
 * formatWeekdayRange(new Date(2026, 7, 1), new Date(2026, 7, 8)) // 'so 1. 8. – so 8. 8. 2026'
 * formatWeekdayRange(new Date(2026, 11, 28), new Date(2027, 0, 3)) // 'po 28. 12. 2026 – ne 3. 1. 2027'
 */
export const formatWeekdayRange = (from: Date, to: Date) => {
	const sameYear = from.getFullYear() === to.getFullYear()
	const fromPattern = sameYear ? 'EEEEEE d. M.' : 'EEEEEE d. M. yyyy'
	return `${format(from, fromPattern, { locale: cs })} – ${format(to, 'EEEEEE d. M. yyyy', { locale: cs })}`
}

/**
 * A calendar date as the plain `yyyy-MM-dd` string the API's `from` / `to`
 * inputs expect. Formatted in local time on purpose — `toISOString()` would
 * shift the day for anyone east or west of UTC.
 *
 * @example
 * toDateString(new Date(2026, 7, 1)) // '2026-08-01'
 */
export const toDateString = (d: Date) => format(d, 'yyyy-MM-dd')

export const formatPhone = (phone: string): string => {
	const digits = phone.replace(/\D/g, '')

	const local = digits.length === 12 && digits.startsWith('420') ? digits.slice(3) : digits

	if (local.length !== 9) return phone

	return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}
