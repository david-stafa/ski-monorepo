import type { inferOutput } from '@trpc/tanstack-react-query'
import type { trpc } from '~/lib/trpc'

/** A single helmet row as returned by `equipment.helmet.getHelmet`. */
export type HelmetListItem = inferOutput<
  typeof trpc.equipment.helmet.getHelmet
>['helmets'][number]
