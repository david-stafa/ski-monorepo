import type { Prisma } from '@ski-blazek/db'
import { rollUpStatus } from './statusFlow'

/**
 * The roll-up from docs/adr/0001: after any change to an item's status, works
 * the person's status out from their items and then the reservation's from its
 * people, and stores both. Run it inside the same transaction as the change.
 *
 * A parent with nothing left to roll up from (no items, or all cancelled) keeps
 * its stored status, and a Cancelled parent is never touched: Cancelled only
 * ever comes from an explicit cancel.
 *
 * The caller must hold `lockReservation` for the reservation, taken before it
 * changed the item.
 */
export const recomputeRolledUpStatus = async (
	tx: Prisma.TransactionClient,
	{ personId, reservationId }: { personId: string | null; reservationId: string }
) => {
	if (personId) {
		const items = await tx.reservationItem.findMany({
			where: { personId },
			select: { status: true },
		})
		const status = rollUpStatus(items.map((item) => item.status))
		if (status) {
			await tx.person.updateMany({
				where: { id: personId, status: { not: 'CANCELLED' } },
				data: { status },
			})
		}
	}

	const people = await tx.person.findMany({
		where: { reservationId },
		select: { status: true },
	})
	const status = rollUpStatus(people.map((person) => person.status))
	if (status) {
		await tx.reservation.updateMany({
			where: { id: reservationId, status: { not: 'CANCELLED' } },
			data: { status },
		})
	}
}

/**
 * Locks the reservation row until the transaction ends. Take it first, before
 * changing any of its items:
 * - Two staff stepping different items of one reservation would otherwise each
 *   read the other's item as unchanged and store a stale roll-up. With the lock
 *   they take turns, and whoever goes second sees both changes.
 * - Cancelling a reservation locks it and then its items. Locking in the same
 *   order here means the two can't deadlock.
 */
export const lockReservation = async (tx: Prisma.TransactionClient, reservationId: string) => {
	await tx.$executeRaw`SELECT 1 FROM "Reservation" WHERE id = ${reservationId} FOR UPDATE`
}
