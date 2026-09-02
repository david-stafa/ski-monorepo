import type { EquipmentItemType, Prisma } from '@ski-blazek/db/browser'
import { seasonStart } from '../../../../schemas/stockCheck'

/*
    The annual sweep: everything of one type that this season's stock check
    never reached. Preview and the sweep itself share this filter, so the list
    staff confirm is exactly the list that gets archived.
 */

/** Live items of `type` not seen since the current season started. */
export const stockSweepWhere = (type: EquipmentItemType): Prisma.EquipmentItemWhereInput => ({
	type,
	retiredAt: null,
	OR: [{ lastCheckedAt: null }, { lastCheckedAt: { lt: seasonStart() } }],
})

/** Enough of each satellite to recognise the item in the confirm dialog. */
export const sweepPreviewSelect = {
	id: true,
	articleGroup: true,
	articleNumber: true,
	lastCheckedAt: true,
	ski: { select: { brand: true, model: true, length: true } },
	snowboard: { select: { brand: true, model: true, length: true } },
	skiBoot: { select: { brand: true, model: true, length: true } },
	snowboardBoot: { select: { brand: true, model: true, length: true } },
	helmet: { select: { brand: true, model: true, size: true } },
} satisfies Prisma.EquipmentItemSelect

export type SweepPreviewRow = Prisma.EquipmentItemGetPayload<{
	select: typeof sweepPreviewSelect
}>

/**
 * One human-readable line per item — "Atomic Bent 165". The five satellites are
 * mutually exclusive, so at most one of them is non-null.
 */
export const sweepItemLabel = (item: SweepPreviewRow) => {
	const gear = item.ski ?? item.snowboard ?? item.skiBoot ?? item.snowboardBoot

	if (gear) return [gear.brand, gear.model, gear.length].filter(Boolean).join(' ')

	if (item.helmet)
		return [item.helmet.brand, item.helmet.model, item.helmet.size].filter(Boolean).join(' ')

	return '—'
}
