import { ReservationStatus } from '@ski-blazek/db/browser'

/**
 * The status flow: the one place that owns the rules for the status shared by
 * reservation items, people and reservations (see `Status` in CONTEXT.md and
 * docs/adr/0001-item-status-is-the-source-of-truth.md).
 *
 * Booked → Prepared → Picked up → Returned, one step at a time, or Cancelled.
 * Cancelled is not a step: it sits outside the order and has no way back.
 */

/** The steps in order. Every item passes through each one, never skipping. */
export const STATUS_STEPS: readonly ReservationStatus[] = [
	ReservationStatus.BOOKED,
	ReservationStatus.PREPARED,
	ReservationStatus.PICKED_UP,
	ReservationStatus.RETURNED,
]

/** The status one step forward, or undefined past Returned and for Cancelled. */
export const nextStatus = (status: ReservationStatus): ReservationStatus | undefined => {
	const index = STATUS_STEPS.indexOf(status)
	if (index === -1) return undefined
	return STATUS_STEPS[index + 1]
}

/** The status one step back (an undo), or undefined for Booked and Cancelled. */
export const previousStatus = (status: ReservationStatus): ReservationStatus | undefined => {
	const index = STATUS_STEPS.indexOf(status)
	if (index <= 0) return undefined
	return STATUS_STEPS[index - 1]
}

/**
 * The rolled-up status of a person (from their items) or a reservation (from
 * its people): the least advanced status among the children that are not
 * cancelled. Undefined when every child is cancelled or there are none — the
 * parent then keeps its own stored status, since Cancelled on a parent only
 * ever comes from an explicit cancel.
 */
export const rollUpStatus = (childStatuses: ReservationStatus[]): ReservationStatus | undefined => {
	let leastAdvanced: number | undefined
	for (const status of childStatuses) {
		const index = STATUS_STEPS.indexOf(status)
		if (index === -1) continue
		if (leastAdvanced === undefined || index < leastAdvanced) leastAdvanced = index
	}
	if (leastAdvanced === undefined) return undefined
	return STATUS_STEPS[leastAdvanced]
}

/** Only what the customer isn't holding yet can be cancelled. Once picked up,
 * it can only end as Returned. */
export const CANCELLABLE_STATUSES: readonly ReservationStatus[] = [
	ReservationStatus.BOOKED,
	ReservationStatus.PREPARED,
]

/**
 * Whether a person or a reservation can still be cancelled: it isn't already,
 * and nothing under it has been picked up or returned. `statuses` are those of
 * everything under it — items, and for a reservation its people too, since an
 * accessories-only person has no items to show they've picked up. Cancelled
 * children don't count: they never left the shop.
 */
export const canCancel = (status: ReservationStatus, statuses: ReservationStatus[]): boolean => {
	if (!CANCELLABLE_STATUSES.includes(status)) return false
	for (const child of statuses) {
		if (child === ReservationStatus.CANCELLED) continue
		if (!CANCELLABLE_STATUSES.includes(child)) return false
	}
	return true
}

/** An item in one of these holds its equipment for its dates. Returned and
 * Cancelled free it immediately, even before the reservation's end date. */
export const OCCUPYING_STATUSES: readonly ReservationStatus[] = [
	ReservationStatus.BOOKED,
	ReservationStatus.PREPARED,
	ReservationStatus.PICKED_UP,
]

/** The timestamp each step sets when an item enters it. Undo clears the one
 * for the step it leaves, so they always match the current status. Booked has
 * none: that's just `createdAt`. */
export const STEP_TIMESTAMP: Partial<
	Record<ReservationStatus, 'preparedAt' | 'pickedUpAt' | 'returnedAt'>
> = {
	PREPARED: 'preparedAt',
	PICKED_UP: 'pickedUpAt',
	RETURNED: 'returnedAt',
}
