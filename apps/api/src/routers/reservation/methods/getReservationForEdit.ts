import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import {
	createEmptyEquipment,
	type ReservationDetail,
	type ReservationIdInput,
} from '../../../schemas/reservation'

/**
 * The edit form's read model, and the single seam between the DB shape and the
 * form shape: Prisma stores gear as ReservationItem join rows, the form works
 * in five fixed slots keyed by equipment type. The fold happens here, once, and
 * the ReservationDetail return annotation is what keeps it honest.
 *
 * Deliberately not `getReservation` — that one feeds the pick-up sheet, which
 * needs the labelled gear tree this one throws away.
 */
export const getReservationForEdit = async ({
	id,
}: ReservationIdInput): Promise<ReservationDetail> => {
	const reservation = await prisma.reservation.findUnique({
		where: { id },
		include: {
			people: {
				// a cancelled person is off the reservation and must not come back
				// as an editable row
				where: { status: 'ACTIVE' },
				include: {
					// likewise a cancelled item must not come back as a filled slot.
					// The form needs the item's id and which slot it belongs in,
					// nothing else — so skip the gear itself.
					reservationItems: {
						where: { status: 'ACTIVE' },
						include: { equipmentItem: { select: { type: true } } },
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

	return {
		id: reservation.id,
		status: reservation.status,
		name: reservation.name,
		phoneNumber: reservation.phoneNumber,
		note: reservation.note,
		startDate: reservation.startDate,
		endDate: reservation.endDate,
		people: reservation.people.map((person) => {
			const equipment = createEmptyEquipment()
			for (const item of person.reservationItems) {
				equipment[item.equipmentItem.type] = item.equipmentItemId
			}

			return {
				id: person.id,
				status: person.status,
				name: person.name,
				weight: person.weight,
				height: person.height,
				age: person.age,
				gender: person.gender,
				poles: person.poles,
				backProtection: person.backProtection,
				skiCover: person.skiCover,
				bootCover: person.bootCover,
				goggles: person.goggles,
				level: person.level,
				note: person.note,
				equipment,
			}
		}),
	}
}
