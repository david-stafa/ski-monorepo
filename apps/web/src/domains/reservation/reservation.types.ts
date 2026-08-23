import type { inferOutput } from '@trpc/tanstack-react-query'
import type { trpc } from '~/lib/trpc'

/** A single reservation row as returned by `reservation.list`. */
export type ReservationListItem = inferOutput<typeof trpc.reservation.list>['reservations'][number]
