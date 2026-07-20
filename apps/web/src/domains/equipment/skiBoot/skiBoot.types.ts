import type { inferOutput } from '@trpc/tanstack-react-query'
import type { trpc } from '~/lib/trpc'

export type SkiBootListItem = inferOutput<
  typeof trpc.equipment.skiBoot.list
>['skiBoots'][number]
