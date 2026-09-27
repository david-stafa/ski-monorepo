import type { ReservationStatus } from '@ski-blazek/db/browser'
import { cn } from '@ski-blazek/ui/lib/utils'
import { RESERVATION_STATUS_META } from '../helpers/reservationStatus'

/** A status as small coloured text with a dot: the quiet alternative to a
 * badge, for rows where many statuses sit under each other. */
export const StatusText = ({ status }: { status: ReservationStatus }) => {
	const { label, textClassName } = RESERVATION_STATUS_META[status]

	return (
		<span className={cn('flex shrink-0 items-center gap-1.5 text-sm', textClassName)}>
			<span className="size-1.5 rounded-full bg-current" />
			{label}
		</span>
	)
}
