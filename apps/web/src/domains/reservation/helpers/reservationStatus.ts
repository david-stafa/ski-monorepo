import { ReservationStatus } from '@ski-blazek/db/browser'
import type { Badge } from '@ski-blazek/ui/components/badge'

type BadgeVariant = React.ComponentProps<typeof Badge>['variant']

/**
 * Single source of truth for how a reservation status is shown: the Czech label
 * and the badge colour. Typed as `Record<ReservationStatus, …>` so adding a new
 * status to the Prisma enum is a compile error until it is filled in here.
 */
export const RESERVATION_STATUS_META: Record<
	ReservationStatus,
	{ label: string; variant: BadgeVariant }
> = {
	[ReservationStatus.BOOKED]: { label: 'Rezervováno', variant: 'secondary' },
	[ReservationStatus.PICKED_UP]: { label: 'Vyzvednuto', variant: 'default' },
	[ReservationStatus.RETURNED]: { label: 'Vráceno', variant: 'outline' },
	[ReservationStatus.CANCELLED]: { label: 'Zrušeno', variant: 'destructive' },
}

/**
 * The statuses in the order they should appear in the filter dropdown, in the
 * `{ value, label }` shape Base UI's Select takes as its `items`.
 */
export const RESERVATION_STATUS_OPTIONS = Object.values(ReservationStatus).map((status) => ({
	value: status,
	label: RESERVATION_STATUS_META[status].label,
}))
