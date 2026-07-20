import type { inferOutput } from '@trpc/tanstack-react-query'
import type { trpc } from '~/lib/trpc'

/** A single snowboard row as returned by `equipment.snowboard.list`. */
export type SnowboardListItem = inferOutput<
  typeof trpc.equipment.snowboard.list
>['snowboards'][number]
