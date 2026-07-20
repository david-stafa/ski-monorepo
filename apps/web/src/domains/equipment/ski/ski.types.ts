import type { inferOutput } from '@trpc/tanstack-react-query'
import type { trpc } from '~/lib/trpc'

/** A single ski row as returned by `equipment.ski.list`. */
export type SkiListItem = inferOutput<
  typeof trpc.equipment.ski.list
>['skis'][number]
