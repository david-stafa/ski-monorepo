import type { inferOutput } from '@trpc/tanstack-react-query'
import type { trpc } from '~/lib/trpc'

/** One fitting appointment as returned by `fitting.listWeekly`. */
export type Fitting = inferOutput<typeof trpc.fitting.listWeekly>['reservations'][number]
