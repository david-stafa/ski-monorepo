import { prisma } from '@ski-blazek/db'
import type { StockSweepInput } from '../../../../schemas/stockCheck'
import { stockSweepWhere } from '../lib/stockSweep'

/**
 * Close the stock check: archive every item of this type that never turned up.
 *
 * Archiving, not deleting — `deleteEquipmentItem` refuses anything with booking
 * history, which after a season is most of the stock. Retiring keeps that
 * history, takes the item out of availability, and releases its article number
 * for reuse (the live-article unique index is partial on `retiredAt`).
 *
 * Same single `retiredAt` write as `retireEquipmentItem`, done in one statement.
 * Returns a plain count rather than Prisma's `BatchPayload`, whose type can't be
 * named across the tRPC router boundary.
 */
export const archiveUnchecked = async ({ type }: StockSweepInput) => {
	const { count } = await prisma.equipmentItem.updateMany({
		where: stockSweepWhere(type),
		data: { retiredAt: new Date() },
	})

	return { count }
}
