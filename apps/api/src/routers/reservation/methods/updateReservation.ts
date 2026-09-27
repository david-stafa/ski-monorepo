import { prisma, ReservationStatus } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import { lockReservation, recomputeRolledUpStatus } from '../../../lib/recomputeRolledUpStatus'
import { canCancel, canRemoveItem } from '../../../lib/statusFlow'
import { isItemAvailable } from '../../../routers/equipment/_shared/methods/findAvailable'
import type { UpdateReservationInput } from '../../../schemas/reservation'
import { personColumns } from './personColumns'

/**
 * Removal is a soft delete throughout, matching cancelReservation: a dropped
 * person or item keeps its row and moves to CANCELLED. That is not only for
 * history — availability only counts items that are not Returned or Cancelled,
 * so flipping the status is exactly what releases the gear back into the pool.
 *
 * And like a cancel, only what hasn't left the shop can be removed: a Picked up
 * or Returned item can't be dropped or swapped, nor can the person holding it.
 * It can only end as Returned.
 */
const CANCELLED = ReservationStatus.CANCELLED
const NOT_CANCELLED = { not: CANCELLED }

export const updateReservation = async (data: UpdateReservationInput) => {
	return await prisma.$transaction(async (tx) => {
		// Before reading, so a status step can't change an item between this
		// read and the edit below.
		await lockReservation(tx, data.id)
		const existing = await tx.reservation.findUnique({
			where: { id: data.id },
			include: {
				people: {
					where: { status: NOT_CANCELLED },
					include: {
						reservationItems: {
							where: { status: NOT_CANCELLED },
							include: { equipmentItem: { select: { type: true } } },
						},
					},
				},
			},
		})

		if (!existing) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Rezervace nebyla nalezena' })
		}

		if (existing.status === CANCELLED) {
			throw new TRPCError({ code: 'CONFLICT', message: 'Zrušenou rezervaci nelze upravit' })
		}

		// Everything on it is finished, so it's read-only like a cancelled one.
		if (existing.status === ReservationStatus.RETURNED) {
			throw new TRPCError({ code: 'CONFLICT', message: 'Vrácenou rezervaci nelze upravit' })
		}

		// A person id in the payload must belong to this reservation — without the
		// check a hand-crafted request could retarget someone else's row.
		const existingPeople = new Map(existing.people.map((person) => [person.id, person]))
		for (const person of data.people) {
			if (person.id && !existingPeople.has(person.id)) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Person ${person.id} is not part of reservation ${data.id}`,
				})
			}
		}

		// Checked against everyone *except* this reservation, so re-submitting the
		// gear it already holds is not a conflict with itself.
		for (const { equipment } of data.people) {
			for (const equipmentItemId of Object.values(equipment)) {
				if (!equipmentItemId) continue

				const isAvailable = await isItemAvailable(
					{
						id: equipmentItemId,
						startDate: data.startDate,
						endDate: data.endDate,
						excludeReservationId: data.id,
					},
					tx
				)
				if (!isAvailable) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: `Item ${equipmentItemId} is already booked`,
					})
				}
			}
		}

		await tx.reservation.update({
			where: { id: data.id },
			data: {
				name: data.name,
				phoneNumber: data.phoneNumber,
				note: data.note,
				startDate: data.startDate,
				endDate: data.endDate,
			},
		})

		// A ReservationItem carries its own dates, so a changed range has to be
		// written onto every row that survives the edit.
		const itemDates = { startDate: data.startDate, endDate: data.endDate }

		// People the payload no longer mentions are off the reservation, and their
		// gear goes back in the pool with them.
		const keptPersonIds = new Set(data.people.map((person) => person.id))
		for (const person of existing.people) {
			if (keptPersonIds.has(person.id)) continue

			const itemStatuses = person.reservationItems.map((item) => item.status)
			if (!canCancel(person.status, itemStatuses)) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Osobu, která už má vybavení vydané, nelze odebrat',
				})
			}

			await tx.person.update({
				where: { id: person.id },
				data: {
					status: CANCELLED,
					cancelledAt: new Date(),
					reservationItems: {
						updateMany: {
							where: { status: NOT_CANCELLED },
							data: { status: CANCELLED, cancelledAt: new Date() },
						},
					},
				},
			})
		}

		for (const person of data.people) {
			const assignedItemIds = Object.values(person.equipment).filter((id) => id !== null)

			if (!person.id) {
				await tx.person.create({
					data: {
						...personColumns(person),
						reservation: { connect: { id: data.id } },
						reservationItems: {
							create: assignedItemIds.map((equipmentItemId) => ({
								...itemDates,
								status: 'BOOKED',
								reservation: { connect: { id: data.id } },
								equipmentItem: { connect: { id: equipmentItemId } },
							})),
						},
					},
				})
				continue
			}

			await tx.person.update({
				where: { id: person.id },
				data: personColumns(person),
			})

			// Diff the five slots against what this person currently holds. A slot
			// whose item did not change keeps its row — only the dates are
			// refreshed — so an unrelated edit doesn't churn the item history.
			const current = existingPeople.get(person.id)
			// keyed by slot name rather than EquipmentItemType so the Object.entries
			// keys below line up without a cast; the values come from the same enum
			const heldBySlot = new Map<string, NonNullable<typeof current>['reservationItems'][number]>(
				current?.reservationItems.map((item) => [item.equipmentItem.type, item]) ?? []
			)

			for (const [slot, desiredItemId] of Object.entries(person.equipment)) {
				const held = heldBySlot.get(slot)

				if (held && held.equipmentItemId === desiredItemId) {
					await tx.reservationItem.update({ where: { id: held.id }, data: itemDates })
					continue
				}

				if (held) {
					if (!canRemoveItem(held.status)) {
						throw new TRPCError({
							code: 'CONFLICT',
							message: 'Vydané ani vrácené vybavení nelze odebrat ani vyměnit',
						})
					}
					await tx.reservationItem.update({
						where: { id: held.id },
						data: { status: CANCELLED, cancelledAt: new Date() },
					})
				}

				if (desiredItemId) {
					await tx.reservationItem.create({
						data: {
							...itemDates,
							status: 'BOOKED',
							reservation: { connect: { id: data.id } },
							person: { connect: { id: person.id } },
							equipmentItem: { connect: { id: desiredItemId } },
						},
					})
				}
			}
		}

		// Dropped, swapped and added items all move the rolled-up statuses: a new
		// Booked item holds its person back, a dropped one may let them move on.
		const people = await tx.person.findMany({
			where: { reservationId: data.id },
			select: { id: true },
		})
		for (const person of people) {
			await recomputeRolledUpStatus(tx, { personId: person.id, reservationId: data.id })
		}

		return { reservation: { id: data.id } }
	})
}
