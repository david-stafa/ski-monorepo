import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { isItemOverdue, isPersonOverdue, isReservationOverdue } from '../../../lib/overdue'
import {
	isItemLatePrep,
	isItemMissedPickup,
	isItemPrepToday,
	isPersonLatePrep,
	isPersonMissedPickup,
	isPersonPrepToday,
	isReservationLatePrep,
	isReservationMissedPickup,
	isReservationPrepToday,
} from '../../../lib/startDateFlags'
import type { ReservationIdInput } from '../../../schemas/reservation'

export const getReservation = async ({ id }: ReservationIdInput) => {
	const reservation = await prisma.reservation.findUnique({
		where: { id },
		include: {
			// Detail view = the full tree: reservation -> people -> their items -> the gear itself.
			people: {
				include: {
					reservationItems: {
						include: {
							equipmentItem: {
								include: {
									ski: true,
									skiBoot: true,
									snowboard: true,
									snowboardBoot: true,
									helmet: true,
								},
							},
						},
					},
				},
			},
		},
	})

	if (!reservation) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: `Reservation ${id} not found`,
		})
	}

	const now = new Date()
	return {
		...reservation,
		overdue: isReservationOverdue(reservation, now),
		prepToday: isReservationPrepToday(reservation, now),
		latePrep: isReservationLatePrep(reservation, now),
		missedPickup: isReservationMissedPickup(reservation, now),
		people: reservation.people.map((person) => ({
			...person,
			overdue: isPersonOverdue(person, reservation.endDate, now),
			prepToday: isPersonPrepToday(person, reservation.startDate, now),
			latePrep: isPersonLatePrep(person, reservation.startDate, now),
			missedPickup: isPersonMissedPickup(person, reservation.startDate, now),
			reservationItems: person.reservationItems.map((item) => ({
				...item,
				overdue: isItemOverdue(item, reservation.endDate, now),
				prepToday: isItemPrepToday(item, reservation.startDate, now),
				latePrep: isItemLatePrep(item, reservation.startDate, now),
				missedPickup: isItemMissedPickup(item, reservation.startDate, now),
			})),
		})),
	}
}
