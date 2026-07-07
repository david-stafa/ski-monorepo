import type { inferOutput } from '@trpc/tanstack-react-query'
import type { trpc } from '~/lib/trpc'

/** A single ski row as returned by `equipment.ski.getSki`. */
export type SkiListItem = inferOutput<
  typeof trpc.equipment.ski.getSki
>['ski'][number]
