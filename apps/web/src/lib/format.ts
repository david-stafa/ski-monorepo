import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

/**
 * Formats a date in the Czech locale as `d. M. yyyy`.
 *
 * @example
 * formatDate(new Date(2026, 7, 1)) // '1. 8. 2026'
 */
export const formatDate = (d: Date) => format(d, 'd. M. yyyy', { locale: cs })
