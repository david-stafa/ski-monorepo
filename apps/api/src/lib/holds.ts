import type { Prisma } from '@ski-blazek/db'
import { ReservationStatus } from '@ski-blazek/db/browser'

/**
 * What a person "holds": their reservation items' statuses — or, when they
 * rent only accessories and have no items to go on, their own status. Every
 * flag in CONTEXT.md (Overdue, Prep today, Late prep, Missed pickup) is "holds
 * gear in status X" plus a date rule, and rolls up to the reservation with
 * "any person".
 */

export type HoldingPerson = {
	status: ReservationStatus
	reservationItems: { status: ReservationStatus }[]
}

/** Whether any of this person's gear, or the person themselves when they rent
 * only accessories, is in `status`. */
export const personHolds = (person: HoldingPerson, status: ReservationStatus): boolean => {
	const items = person.reservationItems.filter(
		(item) => item.status !== ReservationStatus.CANCELLED
	)
	// accessories only: the person's own status is all there is to go on
	if (items.length === 0) return person.status === status
	return items.some((item) => item.status === status)
}

/**
 * The same rule as `personHolds`, as a list query for "someone on the
 * reservation holds gear in one of `statuses`". Unlike the rolled-up status,
 * this still finds a family whose parents have picked up while one child's
 * skis wait on the shelf.
 */
export const holdsWhere = (statuses: ReservationStatus[]): Prisma.ReservationWhereInput => ({
	people: {
		some: {
			OR: [
				{ reservationItems: { some: { status: { in: statuses } } } },
				{
					status: { in: statuses },
					reservationItems: { none: { status: { not: ReservationStatus.CANCELLED } } },
				},
			],
		},
	},
})
