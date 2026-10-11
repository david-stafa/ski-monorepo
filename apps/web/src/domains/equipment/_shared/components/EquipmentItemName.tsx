import type { AvailableItem } from '~/domains/equipment/_shared/types'

/** Brand and model of any equipment item, whatever its type. */
export const EquipmentItemName = ({ item }: { item: AvailableItem }) => {
	// Exactly one detail row is filled (see `types.ts`), and every type has
	// a brand and a model, so whichever one is there will do.
	const detail = item.ski ?? item.snowboard ?? item.skiBoot ?? item.snowboardBoot ?? item.helmet
	if (!detail) return null

	return (
		<span className="truncate">
			<span className="font-medium text-base">{detail.brand}</span>
			{detail.model && <span className="ml-2 text-muted-foreground">{detail.model}</span>}
		</span>
	)
}
