import type { Prisma } from '@ski-blazek/db'
import { ReservationStatus } from '@ski-blazek/db/browser'
import { type HoldingPerson, holdsWhere, personHolds } from './holds'

/**
 * Overdue (see CONTEXT.md): gear still Picked up after the reservation's end
 * date. End dates are stored as the last moment of their day, so "the end date
 * has passed" is a plain `endDate < now` — on the end date itself nothing is
 * overdue yet, and no timezone has to be picked.
 *
 * What is out: a Picked up item, or a Picked up person with no items to roll
 * up from (renting only accessories, moved by hand).
 */

const isPastEnd = (endDate: Date, now: Date) => endDate < now

/** Whether this item is overdue on a reservation ending at `endDate`. */
export const isItemOverdue = (
	item: { status: ReservationStatus },
	endDate: Date,
	now: Date
): boolean => isPastEnd(endDate, now) && item.status === ReservationStatus.PICKED_UP

/** Whether any of this person's gear, or their accessories, is overdue. */
export const isPersonOverdue = (person: HoldingPerson, endDate: Date, now: Date): boolean =>
	isPastEnd(endDate, now) && personHolds(person, ReservationStatus.PICKED_UP)

/** Whether anything on this reservation is overdue. */
export const isReservationOverdue = (
	reservation: { endDate: Date; people: HoldingPerson[] },
	now: Date
): boolean => reservation.people.some((person) => isPersonOverdue(person, reservation.endDate, now))

/** The same rule as `isReservationOverdue`, for a list query. */
export const overdueWhere = (now: Date): Prisma.ReservationWhereInput => ({
	endDate: { lt: now },
	...holdsWhere([ReservationStatus.PICKED_UP]),
})
