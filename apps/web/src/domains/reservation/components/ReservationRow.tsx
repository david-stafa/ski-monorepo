import { Badge } from '@ski-blazek/ui/components/badge'
import { TableCell, TableRow } from '@ski-blazek/ui/components/table'
import { cn } from '@ski-blazek/ui/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { formatDate } from '~/lib/format'
import type { ReservationListItem } from '../reservation.types'
import { FlagsOrStatus } from './FlagBadges'
import { ReservationActions } from './ReservationActions'
import { ReservationStatusBadge } from './ReservationStatusBadge'

type ReservationRowProps = {
	reservation: ReservationListItem
	/** The counter pages open the reservation in a drawer to work through a
	 * queue. Without it, as on the main list, the row opens the detail page and
	 * the name is a real link to it, so it can still open in a new tab. */
	onOpen?: () => void
	/** Only the main list has the Vytvořeno column. */
	showCreatedAt?: boolean
}

export const ReservationRow = ({ reservation, onOpen, showCreatedAt }: ReservationRowProps) => {
	const navigate = useNavigate()
	const openDetail = () =>
		navigate({ to: '/reservation/$reservationId', params: { reservationId: reservation.id } })

	return (
		<TableRow className={cn('cursor-pointer', onOpen && 'h-14')} onClick={onOpen ?? openDetail}>
			{/* its own menu, not a click on the row */}
			<TableCell onClick={(event) => event.stopPropagation()}>
				<ReservationActions reservation={reservation} />
			</TableCell>
			<TableCell>
				<span
					className="inline-block max-w-56 truncate align-middle font-medium"
					title={reservation.name}
				>
					{reservation.name}
				</span>
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
			{showCreatedAt && <TableCell>{formatDate(reservation.createdAt)}</TableCell>}
		</TableRow>
	)
}
