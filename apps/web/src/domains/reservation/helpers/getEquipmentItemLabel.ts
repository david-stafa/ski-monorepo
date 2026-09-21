import { colorLabel } from '~/domains/equipment/_shared/helpers/colorOptions'
import { formatArticleNumber } from '~/domains/equipment/_shared/helpers/formatArticleNumber'
import { formatCircumference, helmetSizeLabel } from '~/domains/equipment/helmet/helmetOptions'
import type { Outputs } from '~/lib/trpc'

type AvailableItem = Outputs['equipment']['equipmentItem']['findAvailable'][number]

/** Drops the parts a piece of gear does not have and spaces out the rest. */
const line = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')
const describeEquipmentItem = (item: AvailableItem): string | null => {
	switch (item.type) {
		case 'SKI': {
			const ski = item.ski
			if (!ski) return null
			return line(
				`${ski.length} cm`,
				ski.brand,
				ski.model,
				// The row hides this badge below 140 cm, where kids skis are obvious
				// anyway; the label keeps it so typing "dětské" finds all of them.
				ski.isKids && 'Dětské',
				ski.isOld && 'Starší',
				ski.isVIP && 'VIP'
			)
		}
		case 'SNOWBOARD': {
			const snowboard = item.snowboard
			if (!snowboard) return null
			return line(`${snowboard.length} cm`, snowboard.brand, snowboard.model)
		}
		case 'SKI_BOOT': {
			const boot = item.skiBoot
			if (!boot) return null
			return line(
				`${boot.length} mp`,
				boot.brand,
				boot.model,
				boot.color && colorLabel(boot.color),
				boot.isKids && 'Dětské'
			)
		}
		case 'SNOWBOARD_BOOT': {
			const boot = item.snowboardBoot
			if (!boot) return null
			return line(
				`${boot.length} mp`,
				boot.brand,
				boot.model,
				boot.isBoa && 'BOA',
				boot.isKids && 'Dětské'
			)
		}
		case 'HELMET': {
			const helmet = item.helmet
			if (!helmet) return null
			// Size and circumference are both optional until stocktaking fills them
			// in, so each drops out on its own — the same way the row treats them.
			const hasCircumference = helmet.circumferenceMin !== null && helmet.circumferenceMax !== null
			return line(
				helmet.size && helmetSizeLabel(helmet.size),
				helmet.brand,
				helmet.model,
				colorLabel(helmet.color),
				hasCircumference && formatCircumference(helmet.circumferenceMin, helmet.circumferenceMax),
				helmet.withIntegratedGoggles && 'S brýlemi'
			)
		}
	}
}

export const getEquipmentItemLabel = (item: AvailableItem): string => {
	const article = formatArticleNumber(item)
	const description = describeEquipmentItem(item)

	// The separator keeps the article number from running into the measurement
	// that follows it — "26.86 26.5 mp" reads as one mangled number otherwise.
	return description ? `${article} · ${description}` : article
}
