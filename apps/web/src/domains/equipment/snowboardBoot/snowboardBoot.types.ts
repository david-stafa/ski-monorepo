import type { inferOutput } from '@trpc/tanstack-react-query'
import type { trpc } from '~/lib/trpc'

/** A single snowboard boot row as returned by `equipment.snowboardBoot.list`. */
export type SnowboardBootListItem = inferOutput<
  typeof trpc.equipment.snowboardBoot.list
>['snowboardBoots'][number]
