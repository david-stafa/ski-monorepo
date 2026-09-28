import { Badge } from '@ski-blazek/ui/components/badge'
import { TableCell, TableRow } from '@ski-blazek/ui/components/table'
import { Link } from '@tanstack/react-router'
import { formatDate } from '~/lib/format'
import type { ReservationListItem } from '../reservation.types'
import { LatePrepBadge, MissedPickupBadge, OverdueBadge, PrepTodayBadge } from './FlagBadges'
import { ReservationActions } from './ReservationActions'
import { ReservationStatusBadge } from './ReservationStatusBadge'

type ReservationRowProps = {
	reservation: ReservationListItem
	/** The counter pages open the reservation in a drawer to work through a
	 * queue: the whole row is the tap target then. Without it, the name links to
	 * the detail page, as on the main list. */
	onOpen?: () => void
}

export const ReservationRow = ({ reservation, onOpen }: ReservationRowProps) => (
	<TableRow className={onOpen && 'h-14 cursor-pointer'} onClick={onOpen}>
		{/* its own menu, not a click on the row */}
		<TableCell onClick={(event) => event.stopPropagation()}>
			<ReservationActions reservation={reservation} />
		</TableCell>
		<TableCell>
			{onOpen ? (
				<span className="font-medium">{reservation.name}</span>
			) : (
				<Link
					to="/reservation/$reservationId"
					params={{ reservationId: reservation.id }}
					className="font-medium hover:underline"
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
		<TableCell>{reservation.phoneNumber}</TableCell>
		<TableCell>
			{formatDate(reservation.startDate)}
			{(reservation.prepToday || reservation.latePrep || reservation.missedPickup) && (
				<span className="ml-2 inline-flex gap-1">
					{reservation.prepToday && <PrepTodayBadge />}
					{reservation.latePrep && <LatePrepBadge />}
					{reservation.missedPickup && <MissedPickupBadge />}
				</span>
			)}
		</TableCell>
		<TableCell>
			{formatDate(reservation.endDate)}
			{reservation.overdue && (
				<span className="ml-2">
					<OverdueBadge />
				</span>
			)}
		</TableCell>
		<TableCell>{reservation._count.people}</TableCell>
		<TableCell>{reservation._count.reservationItems}</TableCell>
		<TableCell>
			<ReservationStatusBadge status={reservation.status} />
		</TableCell>
	</TableRow>
)
