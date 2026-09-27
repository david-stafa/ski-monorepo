import type { ReservationStatus } from '@ski-blazek/db/browser'

type PersonWithItems = {
	status: ReservationStatus
	reservationItems: { status: ReservationStatus }[]
}

/**
 * The statuses a next step moves for one person: their items that are not
 * cancelled, or — for someone with no items, renting only accessories — the
 * person itself, whom staff move by hand.
 */
export const getPersonStepStatuses = ({ status, reservationItems }: PersonWithItems) => {
	const items = reservationItems.filter((item) => item.status !== 'CANCELLED')
	return items.length === 0 ? [status] : items.map((item) => item.status)
}
