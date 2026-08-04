import { formatArticleNumber } from '~/domains/equipment/_shared/helpers/formatArticleNumber'
import type { Outputs } from '~/lib/trpc'

type AvailableItem =
  Outputs['equipment']['equipmentItem']['findAvailable'][number]

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
      return `${ski.brand} ${ski.model} ${ski.length} cm${ski.isVIP ? ' ⭐' : ''}`
    }
    case 'SNOWBOARD': {
      const snowboard = item.snowboard
      if (!snowboard) return null
      return `${snowboard.brand} ${snowboard.model} ${snowboard.length} cm`
    }
    case 'SKI_BOOT': {
      const boot = item.skiBoot
      if (!boot) return null
      return `${boot.brand} ${boot.model} ${boot.length} mp`
    }
    case 'SNOWBOARD_BOOT': {
      const boot = item.snowboardBoot
      if (!boot) return null
      return `${boot.brand} ${boot.model} ${boot.length} mp${boot.isBoa ? ' BOA' : ''}`
    }
    case 'HELMET': {
      const helmet = item.helmet
      if (!helmet) return null
      return `${helmet.name} ${helmet.size} ${helmet.color}`
    }
  }
}

/**
 * The whole option label, article number included — owning the full string here
 * is what stops a caller prefixing the article number a second time.
 */
export const getEquipmentItemLabel = (item: AvailableItem): string => {
  const description = describeEquipmentItem(item)
  const articleNumber = formatArticleNumber(item)

  return description ? `${articleNumber}: ${description}` : articleNumber
}
