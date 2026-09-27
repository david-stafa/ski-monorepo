import { type Prisma, prisma, ReservationStatus } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { lockReservation, recomputeRolledUpStatus } from '../../../lib/recomputeRolledUpStatus'
import { nextStatus, previousStatus, STEP_TIMESTAMP } from '../../../lib/statusFlow'
import { isItemAvailable } from '../../../routers/equipment/_shared/methods/findAvailable'
import type { ReservationStepInput } from '../../../schemas/statusStep'

const STALE_MESSAGE = 'Rezervaci mezitím změnil někdo jiný. Obnovte stránku a zkuste to znovu.'

/**
 * Moves exactly the listed items and accessories-only people of a reservation
 * one step each, forward or back, then rolls each touched person and the
 * reservation up. All or nothing: if any target is no longer where the staff
 * member saw it, or can't take the step, nothing moves.
 *
 * The counter sheets use it to hand out "the rest" (only what is ready, so a
 * Booked item stays behind), and its undo toast sends the same targets back.
 */
export const stepReservation = async ({ id, direction, items, people }: ReservationStepInput) => {
	if (items.length + people.length === 0)
		throw new TRPCError({ code: 'CONFLICT', message: 'Není co posunout' })

	const stepOf = (from: ReservationStatus) =>
		direction === 'forward' ? nextStatus(from) : previousStatus(from)

	return await prisma.$transaction(async (tx) => {
		await lockReservation(tx, id)
		// Read after the lock, so no other step can slip in between the checks
		// and the updates.
		const reservation = await tx.reservation.findUnique({ where: { id } })
		if (!reservation)
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Rezervace nebyla nalezena' })

		const touchedPeople = new Set<string>()

		const foundItems = await tx.reservationItem.findMany({
			where: { id: { in: items.map((target) => target.id) }, reservationId: id },
		})
		for (const target of items) {
			const item = foundItems.find((found) => found.id === target.id)
			if (!item) throw new TRPCError({ code: 'NOT_FOUND', message: 'Položka nebyla nalezena' })
			if (item.status !== target.from)
				throw new TRPCError({ code: 'CONFLICT', message: STALE_MESSAGE })
			const to = stepOf(target.from)
			if (!to)
				throw new TRPCError({ code: 'CONFLICT', message: 'Položku nelze posunout tímto směrem' })

			// Returned freed the equipment, so someone else may have booked it since.
			if (direction === 'back' && target.from === ReservationStatus.RETURNED) {
				const isAvailable = await isItemAvailable(
					{
						id: item.equipmentItemId,
						startDate: item.startDate,
						endDate: item.endDate,
						excludeReservationId: id,
					},
					tx
				)
				if (!isAvailable)
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'Vybavení si mezitím zarezervoval někdo jiný, vrácení nelze vzít zpět',
					})
			}

			// forward stamps the step it enters; back clears the one it leaves
			const data: Prisma.ReservationItemUpdateInput = { status: to }
			const timestamp = STEP_TIMESTAMP[direction === 'forward' ? to : target.from]
			if (timestamp) data[timestamp] = direction === 'forward' ? new Date() : null
			await tx.reservationItem.update({ where: { id: item.id }, data })
			if (item.personId) touchedPeople.add(item.personId)
		}

		const foundPeople = await tx.person.findMany({
			where: { id: { in: people.map((target) => target.id) }, reservationId: id },
			include: {
				reservationItems: { where: { status: { not: 'CANCELLED' } }, select: { id: true } },
			},
		})
		for (const target of people) {
			const person = foundPeople.find((found) => found.id === target.id)
			if (!person) throw new TRPCError({ code: 'NOT_FOUND', message: 'Osoba nebyla nalezena' })
			if (person.status !== target.from)
				throw new TRPCError({ code: 'CONFLICT', message: STALE_MESSAGE })
			// someone with gear moves through their items instead
			if (person.reservationItems.length > 0)
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Osoba má vybavení, posuňte jednotlivé položky',
				})
			const to = stepOf(target.from)
			if (!to)
				throw new TRPCError({ code: 'CONFLICT', message: 'Osobu nelze posunout tímto směrem' })

			await tx.person.update({ where: { id: person.id }, data: { status: to } })
			touchedPeople.add(person.id)
		}

		for (const personId of touchedPeople) {
			await recomputeRolledUpStatus(tx, { personId, reservationId: id })
		}
		return await tx.reservation.findUniqueOrThrow({ where: { id } })
	})
}
