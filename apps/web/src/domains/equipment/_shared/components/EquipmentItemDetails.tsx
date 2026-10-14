import { cn } from '@ski-blazek/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { ArticleNumberBadge } from '~/domains/equipment/_shared/components/badges/ArticleNumberBadge'
import { EquipmentItemBadges } from '~/domains/equipment/_shared/components/badges/EquipmentBadges'
import { EquipmentItemName } from '~/domains/equipment/_shared/components/EquipmentItemName'
import { EQUIPMENT_TYPE_LABELS } from '~/domains/equipment/_shared/helpers/equipmentLabels'
import type { AvailableItem } from '~/domains/equipment/_shared/types'

type EquipmentItemDetailsProps = {
	item: AvailableItem
	/** Sits on the right of the first line. */
	aside: React.ReactNode
	/** Greys out the gear (not the aside). */
	muted?: boolean
	/** Strikes the article number and name through, e.g. for cancelled gear. */
	struck?: boolean
	/** Makes the article number and name a link to the item's page. Leave off
	 * inside a `<label>`, where a click should tick the checkbox instead. */
	linked?: boolean
}

/**
 * One piece of gear laid out the same everywhere it is listed: article number
 * and name on the first line, its type and badges on the second.
 */
export const EquipmentItemDetails = ({
	item,
	aside,
	muted = false,
	struck = false,
	linked = false,
}: EquipmentItemDetailsProps) => {
	const nameClassName = cn(
		'flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1',
		muted && 'opacity-60',
		struck && 'line-through'
	)
	const name = (
		<>
			<ArticleNumberBadge articleGroup={item.articleGroup} articleNumber={item.articleNumber} />
			<EquipmentItemName item={item} />
		</>
	)

	return (
		<div className="flex w-full min-w-0 flex-col gap-2">
			<div className="flex items-start justify-between gap-3 md:items-center">
				{linked ? (
					<Link
						to="/equipment/$equipmentId"
						params={{ equipmentId: item.id }}
						className={cn(nameClassName, 'hover:underline')}
					>
						{name}
					</Link>
				) : (
					<div className={nameClassName}>{name}</div>
				)}
				<div className="shrink-0">{aside}</div>
			</div>
			<div className={cn('flex flex-wrap items-center gap-2', muted && 'opacity-60')}>
				<span className="text-muted-foreground text-sm">{EQUIPMENT_TYPE_LABELS[item.type]}</span>
				<EquipmentItemBadges item={item} />
			</div>
		</div>
	)
}
