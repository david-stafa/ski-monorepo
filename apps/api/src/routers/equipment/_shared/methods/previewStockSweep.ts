import { prisma } from '@ski-blazek/db'
import type { StockSweepInput } from '../../../../schemas/stockCheck'
import { stockSweepWhere, sweepItemLabel, sweepPreviewSelect } from '../lib/stockSweep'

/**
 * What `archiveUnchecked` would archive, flattened to one line per item so the
 * confirm dialog doesn't need to know how the five equipment types differ.
 */
export const previewStockSweep = async ({ type }: StockSweepInput) => {
	const items = await prisma.equipmentItem.findMany({
		where: stockSweepWhere(type),
		select: sweepPreviewSelect,
		orderBy: [{ articleGroup: 'asc' }, { articleNumber: 'asc' }],
	})

	return items.map((item) => ({
		id: item.id,
		articleGroup: item.articleGroup,
		articleNumber: item.articleNumber,
		lastCheckedAt: item.lastCheckedAt,
		label: sweepItemLabel(item),
	}))
}
