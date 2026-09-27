import { ReservationStatus } from '@ski-blazek/db/browser'
import type { Badge } from '@ski-blazek/ui/components/badge'

type BadgeVariant = React.ComponentProps<typeof Badge>['variant']

/**
 * Single source of truth for how a reservation status is shown: the Czech label
 * the badge colour, and the text colour where it is shown as plain text (the
 * detail page and the counter drawer, see StatusText). Typed as `Record<ReservationStatus, …>` so adding a new
 * status to the Prisma enum is a compile error until it is filled in here.
 */
export const RESERVATION_STATUS_META: Record<
	ReservationStatus,
	{ label: string; variant: BadgeVariant; textClassName: string }
> = {
	[ReservationStatus.BOOKED]: {
		label: 'Rezervováno',
		variant: 'secondary',
		textClassName: 'text-muted-foreground',
	},
	[ReservationStatus.PREPARED]: {
		label: 'Připraveno',
		variant: 'cyan',
		textClassName: 'text-cyan-600 dark:text-cyan-400',
	},
	[ReservationStatus.PICKED_UP]: {
		label: 'Vyzvednuto',
		variant: 'default',
		textClassName: 'text-primary',
	},
	[ReservationStatus.RETURNED]: {
		label: 'Vráceno',
		variant: 'success',
		textClassName: 'text-success',
	},
	[ReservationStatus.CANCELLED]: {
		label: 'Zrušeno',
		variant: 'destructive',
		textClassName: 'text-destructive',
	},
}

/**
 * The statuses in the order they should appear in the filter dropdown, in the
 * `{ value, label }` shape Base UI's Select takes as its `items`.
 */
export const RESERVATION_STATUS_OPTIONS = Object.values(ReservationStatus).map((status) => ({
	value: status,
	label: RESERVATION_STATUS_META[status].label,
}))

/**
 * The button that moves a person or a reservation into a status, named for the
 * action rather than the result: "Připravit" moves Booked to Prepared.
 */
export const NEXT_STEP_ACTION_LABELS: Partial<Record<ReservationStatus, string>> = {
	[ReservationStatus.PREPARED]: 'Připravit',
	[ReservationStatus.PICKED_UP]: 'Vydat',
	[ReservationStatus.RETURNED]: 'Vrátit',
}
