import type { Outputs } from '~/lib/trpc'

export type AvailableItem = Outputs['equipment']['equipmentItem']['findAvailable'][number]

/**
 * EquipmentItem is common-table-inheritance, so Prisma types all five detail
 * relations as nullable even though exactly one is filled. Each option
 * component takes its own detail row already narrowed — the dispatcher does the
 * null check once, in the same place it reads `type`.
 */
export type SkiDetail = NonNullable<AvailableItem['ski']>
export type SnowboardDetail = NonNullable<AvailableItem['snowboard']>
export type SkiBootDetail = NonNullable<AvailableItem['skiBoot']>
export type SnowboardBootDetail = NonNullable<AvailableItem['snowboardBoot']>
export type HelmetDetail = NonNullable<AvailableItem['helmet']>
