import type { Prisma } from '@ski-blazek/db'
import { ReservationStatus } from '@ski-blazek/db/browser'
import { type HoldingPerson, holdsWhere, personHolds } from './holds'

/**
 * Prep today, Late prep and Missed pickup (see CONTEXT.md): gear not handed
 * over yet, measured against the reservation's start date. Start dates are
 * stored as the first moment of their (shop-local) day, so "on the start date"
 * is taken as the 24 hours from `startDate` and "after it" as anything past
 * them — no timezone has to be picked on the server. Unlike `overdue.ts`, whose
 * stored end-of-day is exact, this is an hour off on the two nights a year the
 * clocks change; nobody is at the counter then.
 *
 * Every flag rolls up like Overdue (see `holds.ts`).
 */

const DAY_MS = 24 * 60 * 60 * 1000

const isStartDay = (startDate: Date, now: Date) =>
	startDate <= now && now.getTime() < startDate.getTime() + DAY_MS

const isPastStartDay = (startDate: Date, now: Date) => now.getTime() >= startDate.getTime() + DAY_MS

/** Whether this item is Prep today on a reservation starting at `startDate`. */
export const isItemPrepToday = (
	item: { status: ReservationStatus },
	startDate: Date,
	now: Date
): boolean => isStartDay(startDate, now) && item.status === ReservationStatus.BOOKED

/** Whether this person has anything still to prepare today. */
export const isPersonPrepToday = (person: HoldingPerson, startDate: Date, now: Date): boolean =>
	isStartDay(startDate, now) && personHolds(person, ReservationStatus.BOOKED)

/** Whether anything on this reservation is Prep today. */
export const isReservationPrepToday = (
	reservation: { startDate: Date; people: HoldingPerson[] },
	now: Date
): boolean =>
	reservation.people.some((person) => isPersonPrepToday(person, reservation.startDate, now))

/** Whether this item is a Late prep on a reservation starting at `startDate`. */
export const isItemLatePrep = (
	item: { status: ReservationStatus },
	startDate: Date,
	now: Date
): boolean => isPastStartDay(startDate, now) && item.status === ReservationStatus.BOOKED

/** Whether this person has anything that should have been prepared already. */
export const isPersonLatePrep = (person: HoldingPerson, startDate: Date, now: Date): boolean =>
	isPastStartDay(startDate, now) && personHolds(person, ReservationStatus.BOOKED)

/** Whether anything on this reservation is a Late prep. */
export const isReservationLatePrep = (
	reservation: { startDate: Date; people: HoldingPerson[] },
	now: Date
): boolean =>
	reservation.people.some((person) => isPersonLatePrep(person, reservation.startDate, now))

/** Whether this item is a Missed pickup on a reservation starting at `startDate`. */
export const isItemMissedPickup = (
	item: { status: ReservationStatus },
	startDate: Date,
	now: Date
): boolean => isPastStartDay(startDate, now) && item.status === ReservationStatus.PREPARED

/** Whether this person has anything ready that they have not come for. */
export const isPersonMissedPickup = (person: HoldingPerson, startDate: Date, now: Date): boolean =>
	isPastStartDay(startDate, now) && personHolds(person, ReservationStatus.PREPARED)

/** Whether anything on this reservation is a Missed pickup. */
export const isReservationMissedPickup = (
	reservation: { startDate: Date; people: HoldingPerson[] },
	now: Date
): boolean =>
	reservation.people.some((person) => isPersonMissedPickup(person, reservation.startDate, now))

/** The same rule as `isReservationPrepToday`, for a list query. */
export const prepTodayWhere = (now: Date): Prisma.ReservationWhereInput => ({
	startDate: { lte: now, gt: new Date(now.getTime() - DAY_MS) },
	...holdsWhere([ReservationStatus.BOOKED]),
})

/** The same rule as `isReservationLatePrep`, for a list query. */
export const latePrepWhere = (now: Date): Prisma.ReservationWhereInput => ({
	startDate: { lte: new Date(now.getTime() - DAY_MS) },
	...holdsWhere([ReservationStatus.BOOKED]),
})

/** The same rule as `isReservationMissedPickup`, for a list query. */
export const missedPickupWhere = (now: Date): Prisma.ReservationWhereInput => ({
	startDate: { lte: new Date(now.getTime() - DAY_MS) },
	...holdsWhere([ReservationStatus.PREPARED]),
})
