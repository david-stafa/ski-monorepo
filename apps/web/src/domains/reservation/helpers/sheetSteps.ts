import type { ReservationStatus } from '@ski-blazek/db/browser'

/**
 * The one step each counter sheet makes: Příprava only prepares, Výdej only
 * hands out, Vrácení only takes back. The detail page is the one place where
 * any step is possible.
 */
export type SheetStep = {
	from: ReservationStatus
	to: ReservationStatus
	/** The line at the top of the drawer telling staff what a tick means. */
	hint: string
}

export const SHEET_STEPS = {
	prep: { from: 'BOOKED', to: 'PREPARED', hint: 'Označte, co je připravené.' },
	pickUp: { from: 'PREPARED', to: 'PICKED_UP', hint: 'Označte, co si zákazník odnáší.' },
	return: { from: 'PICKED_UP', to: 'RETURNED', hint: 'Označte, co zákazník vrátil.' },
} as const satisfies Record<string, SheetStep>
