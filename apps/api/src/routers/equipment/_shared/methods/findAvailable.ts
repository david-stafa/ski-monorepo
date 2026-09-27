import { type Prisma, prisma, ReservationStatus } from '@ski-blazek/db'
import { OCCUPYING_STATUSES } from '../../../../lib/statusFlow'
import type { FindAvailableInput, IsItemAvailableInput } from '../../../../schemas/equipmentItem'

/**
 * A booking that occupies an item for the requested window: overlapping dates
 * (half-open — start < reqEnd AND end > reqStart) AND in a status that holds
 * the gear (Booked, Prepared, Picked up — see statusFlow). Shared by
 * findAvailable + isItemAvailable so the "what counts as booked" rule lives in
 * one place and the two can't drift.
 *
 * `excludeReservationId` drops one reservation's own bookings from the count.
 * An edit re-submits the gear it already holds, and without this every one of
 * those items would look taken — by the very reservation being edited.
 */
const overlappingActiveBooking = (
	reqStart: Date,
	reqEnd: Date,
	excludeReservationId?: string
): Prisma.ReservationItemWhereInput => ({
	startDate: { lt: reqEnd },
	endDate: { gt: reqStart },
	status: { in: [...OCCUPYING_STATUSES] },
	...(excludeReservationId && { reservationId: { not: excludeReservationId } }),
})

export const findAvailable = async ({
	type,
	startDate: reqStart,
	endDate: reqEnd,
	excludeReservationId,
}: FindAvailableInput) => {
	const availableItems = await prisma.equipmentItem.findMany({
		where: {
			type,
			retiredAt: null,
			OR: [
				// available = no overlapping active booking exists
				{
					reservationItems: {
						none: overlappingActiveBooking(reqStart, reqEnd, excludeReservationId),
					},
				},
				// When editing, the reservation's own Returned gear stays listed even if
				// someone has booked it since — its slot is locked, but still has to
				// show what's in it.
				...(excludeReservationId
					? [
							{
								reservationItems: {
									some: {
										reservationId: excludeReservationId,
										status: ReservationStatus.RETURNED,
									},
								},
							},
						]
					: []),
			],
		},
		include: {
			ski: true,
			skiBoot: true,
			snowboard: true,
			snowboardBoot: true,
			helmet: true,
		},
		// Sticker order: pool first, then sequence, so the boot picker lists
		// 26.1, 26.2 … before the 27s instead of interleaving the two sizes.
		orderBy:
			type === 'SKI'
				? [{ ski: { length: 'asc' } }, { articleGroup: 'asc' }, { articleNumber: 'asc' }]
				: [{ articleGroup: 'asc' }, { articleNumber: 'asc' }],
	})

	return availableItems
}

export const isItemAvailable = async (
	{ id, startDate: reqStart, endDate: reqEnd, excludeReservationId }: IsItemAvailableInput,
	prismaClient: Prisma.TransactionClient = prisma // defaults to the global client
) => {
	const availableItem = await prismaClient.equipmentItem.findUnique({
		where: {
			id,
			retiredAt: null,
			reservationItems: { none: overlappingActiveBooking(reqStart, reqEnd, excludeReservationId) },
		},
	})

	return !!availableItem
}
