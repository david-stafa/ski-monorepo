import { Badge } from '@ski-blazek/ui/components/badge'
import { TableCell, TableRow } from '@ski-blazek/ui/components/table'
import { cn } from '@ski-blazek/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { formatDate } from '~/lib/format'
import type { ReservationListItem } from '../reservation.types'
import { FlagsOrStatus } from './FlagBadges'
import { ReservationActions } from './ReservationActions'
import { ReservationStatusBadge } from './ReservationStatusBadge'

type ReservationRowProps = {
	reservation: ReservationListItem
	/** The counter pages open the reservation in a drawer to work through a
	 * queue: the whole row is the tap target then. Without it, the name links to
	 * the detail page, as on the main list. */
	onOpen?: () => void
}

// Long names are cut short so the status column right after them stays put;
// the full name is in the tooltip.
const NAME_CLASS = 'inline-block max-w-56 truncate align-middle font-medium'

export const ReservationRow = ({ reservation, onOpen }: ReservationRowProps) => (
	<TableRow className={onOpen && 'h-14 cursor-pointer'} onClick={onOpen}>
		{/* its own menu, not a click on the row */}
		<TableCell onClick={(event) => event.stopPropagation()}>
			<ReservationActions reservation={reservation} />
		</TableCell>
		<TableCell>
			{onOpen ? (
				<span className={NAME_CLASS} title={reservation.name}>
					{reservation.name}
				</span>
			) : (
				<Link
					to="/reservation/$reservationId"
					params={{ reservationId: reservation.id }}
					className={cn(NAME_CLASS, 'hover:underline')}
					title={reservation.name}
				>
					{reservation.name}
				</Link>
			)}
			{reservation.seasonal && (
				<Badge variant="outline" className="ml-2">
					Sezónní
				</Badge>
			)}
		</TableCell>
		<TableCell>
			<FlagsOrStatus
				flags={reservation}
				direction="col"
				status={<ReservationStatusBadge status={reservation.status} />}
			/>
		</TableCell>
		<TableCell>{formatDate(reservation.startDate)}</TableCell>
		<TableCell>{formatDate(reservation.endDate)}</TableCell>
		<TableCell>{reservation.phoneNumber}</TableCell>
		<TableCell>{reservation._count.people}</TableCell>
		<TableCell>{reservation._count.reservationItems}</TableCell>
	</TableRow>
)
