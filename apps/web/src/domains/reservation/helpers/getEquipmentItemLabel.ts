import type { EquipmentItemType } from '@ski-blazek/db/browser'
import { formatArticleNumber } from '~/domains/equipment/_shared/helpers/formatArticleNumber'
import { formatCircumference, helmetSizeLabel } from '~/domains/equipment/helmet/helmetOptions'
import type { Outputs } from '~/lib/trpc'

type AvailableItem = Outputs['equipment']['equipmentItem']['findAvailable'][number]

/**
 * Emoji rather than lucide icons because the label is a plain string — the
 * select options in the shared form kit take `label: string`, not a node.
 */
const TYPE_ICONS: Record<EquipmentItemType, string> = {
	SKI: '🎿:',
	SKI_BOOT: '🥾:',
	SNOWBOARD: '🏂:',
	SNOWBOARD_BOOT: '👢:',
	HELMET: '⛑️:',
}

const model = (value: string | null) => (value ? `${value} ` : '')

/**
 * EquipmentItem is common-table-inheritance: exactly one of the five relations
 * is non-null and which one is decided by `type`. Prisma still types them all
 * as nullable, so `describe` returns null if the detail row is somehow missing.
 */
const describeEquipmentItem = (item: AvailableItem): string | null => {
	switch (item.type) {
		case 'SKI': {
			const ski = item.ski
			if (!ski) return null
			return `${ski.brand} ${model(ski.model)}${ski.length} cm${ski.isVIP ? ' ⭐' : ''}`
		}
		case 'SNOWBOARD': {
			const snowboard = item.snowboard
			if (!snowboard) return null
			return `${snowboard.brand} ${model(snowboard.model)}${snowboard.length} cm`
		}
		case 'SKI_BOOT': {
			const boot = item.skiBoot
			if (!boot) return null
			return `${boot.brand} ${model(boot.model)}${boot.length} mp`
		}
		case 'SNOWBOARD_BOOT': {
			const boot = item.snowboardBoot
			if (!boot) return null
			return `${boot.brand} ${model(boot.model)}${boot.length} mp${boot.isBoa ? ' BOA' : ''}`
		}
		case 'HELMET': {
			const helmet = item.helmet
			if (!helmet) return null
			// Size is optional until stocktaking fills it in, so it drops the same
			// way a model does; the circumference is left out entirely, the picker
			// is already long.
			const size = helmet.size ? `${helmetSizeLabel(helmet.size)} ` : ''
			const circumference =
				helmet.circumferenceMax !== null || helmet.circumferenceMax !== null
					? formatCircumference(helmet.circumferenceMin, helmet.circumferenceMax)
					: ''

			return `${helmet.brand} ${model(helmet.model)} ${circumference} ${size} ${helmet.color}`
		}
	}
}

/**
 * The whole option label, icon and article number included — owning the full
 * string here is what stops a caller prefixing either one a second time.
 */
export const getEquipmentItemLabel = (item: AvailableItem): string => {
	const description = describeEquipmentItem(item)
	const articleNumber = formatArticleNumber(item)
	const icon = TYPE_ICONS[item.type]

	return description ? `${icon} ${articleNumber}. ${description}` : `${icon} ${articleNumber}`
}
