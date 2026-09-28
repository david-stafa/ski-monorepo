import { prisma } from '@ski-blazek/db'
import { type Prisma, ReservationStatus } from '@ski-blazek/db/browser'
import { holdsWhere } from '../../../lib/holds'
import { isReservationOverdue, overdueWhere } from '../../../lib/overdue'
import {
	isReservationLatePrep,
	isReservationMissedPickup,
	isReservationPrepToday,
	latePrepWhere,
	missedPickupWhere,
	prepTodayWhere,
} from '../../../lib/startDateFlags'
import { canCancel } from '../../../lib/statusFlow'
import type { GetReservationsInput } from '../../../schemas/reservation'

/**
 * Which reservations fall in the `fromDate`–`toDate` window. The *_DUE modes
 * are the counter pages' lists: what is due in the window, plus everything
 * flagged from before it — a customer who should have come last Friday must
 * not fall off the sheet because the week turned over — and only reservations
 * still holding gear in that page's status(es).
 */
const windowWhere = (
	dateMode: GetReservationsInput['dateMode'],
	fromDate: Date,
	toDate: Date,
	now: Date
): Prisma.ReservationWhereInput => {
	switch (dateMode) {
		case 'PREP_DUE':
			return {
				startDate: { lte: toDate },
				AND: [
					{ OR: [{ startDate: { gte: fromDate } }, prepTodayWhere(now), latePrepWhere(now)] },
					holdsWhere([ReservationStatus.BOOKED]),
				],
			}
		case 'PICKUP_DUE':
			return {
				startDate: { lte: toDate },
				AND: [
					{
						OR: [
							{ startDate: { gte: fromDate } },
							prepTodayWhere(now),
							latePrepWhere(now),
							missedPickupWhere(now),
						],
					},
					holdsWhere([ReservationStatus.BOOKED, ReservationStatus.PREPARED]),
				],
			}
		case 'RETURN_DUE':
			return {
				endDate: { lte: toDate },
				AND: [
					{ OR: [{ endDate: { gte: fromDate } }, overdueWhere(now)] },
					holdsWhere([ReservationStatus.PICKED_UP]),
				],
			}
		case 'RETURN': // takes gear back this week
			return { endDate: { gte: fromDate, lte: toDate } }
		case 'ACTIVE': // out at any point this week
			return { startDate: { lte: toDate }, endDate: { gte: fromDate } }
		default: // PICKUP: hands gear out this week
			return { startDate: { gte: fromDate, lte: toDate } }
	}
}

export const listReservations = async ({
	orderBy,
	orderDirection,
	page,
	itemsPerPage,
	search,
	statuses,
	from,
	to,
	dateMode,
	kind,
}: GetReservationsInput) => {
	// The input carries date-only strings, so widen them to cover the whole day
	// on both ends — otherwise a `to` of '2026-08-06' would cut off at midnight.
	// Anchored in UTC on purpose: a bare calendar date has no timezone, and
	// date-fns' startOfDay/endOfDay would resolve it in the API server's local
	// zone, silently shifting the window when the server isn't running in UTC.
	const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined
	const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined
	const now = new Date()

	const dateWhere = !fromDate || !toDate ? {} : windowWhere(dateMode, fromDate, toDate, now)

	const where: Prisma.ReservationWhereInput = {
		...(search && {
			OR: [
				{ name: { contains: search, mode: 'insensitive' } },
				{ phoneNumber: { contains: search, mode: 'insensitive' } },
				// admins look people up by whoever is actually wearing the gear,
				// not only by whoever booked it
				{
					people: { some: { name: { contains: search, mode: 'insensitive' } } },
				},
			],
		}),
		...(statuses && statuses.length > 0 && { status: { in: statuses } }),
		...(kind !== 'all' && { seasonal: kind === 'seasonal' }),
		// under AND, so its own OR can't overwrite the search's
		AND: [dateWhere],
	}

	const [rows, totalCount] = await prisma.$transaction([
		prisma.reservation.findMany({
			where,
			select: {
				id: true,
				name: true,
				phoneNumber: true,
				note: true,
				status: true,
				startDate: true,
				endDate: true,
				seasonal: true,
				createdAt: true,
				_count: { select: { people: true, reservationItems: true } },
				// only to work out `canCancel` and the flags below
				people: { select: { status: true, reservationItems: { select: { status: true } } } },
				reservationItems: { select: { status: true } },
			},
			skip: (page - 1) * itemsPerPage,
			take: itemsPerPage,
			// `startDate` ties are common, so add a stable tiebreak — without one
			// rows can jump between pages
			orderBy: [{ [orderBy]: orderDirection }, { createdAt: 'desc' }],
		}),

		prisma.reservation.count({ where }),
	])

	// The rolled-up status alone can't tell: a family is still Booked while one
	// of them has already picked up, and then it can't be cancelled.
	const reservations = rows.map(({ people, reservationItems, ...reservation }) => ({
		...reservation,
		canCancel: canCancel(
			reservation.status,
			[...people, ...reservationItems].map((child) => child.status)
		),
		overdue: isReservationOverdue({ endDate: reservation.endDate, people }, now),
		prepToday: isReservationPrepToday({ startDate: reservation.startDate, people }, now),
		latePrep: isReservationLatePrep({ startDate: reservation.startDate, people }, now),
		missedPickup: isReservationMissedPickup({ startDate: reservation.startDate, people }, now),
	}))

	return { reservations, totalCount }
}
