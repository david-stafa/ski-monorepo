import { canEdit } from '@ski-blazek/api/schemas'
import { Button } from '@ski-blazek/ui/components/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { Link } from '@tanstack/react-router'
import { BanIcon, EllipsisVerticalIcon, PencilIcon } from 'lucide-react'
import { useState } from 'react'
import type { ReservationListItem } from '../reservation.types'
import { CancelReservationDialog } from './CancelReservationDialog'

type ReservationActionsProps = {
	reservation: ReservationListItem
}

export const ReservationActions = ({ reservation }: ReservationActionsProps) => {
	const [cancelOpen, setCancelOpen] = useState(false)

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button variant="default" size="icon-sm" />}>
					<EllipsisVerticalIcon />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{/* EDIT */}
					{canEdit(reservation.status) && (
						<DropdownMenuItem
							render={
								<Link
									to="/reservation/$reservationId/edit"
									params={{ reservationId: reservation.id }}
								/>
							}
						>
							<PencilIcon />
							Upravit rezervaci
						</DropdownMenuItem>
					)}
					{/* CANCEL — only while nothing has been picked up, and not twice */}
					{reservation.canCancel && (
						<DropdownMenuItem variant="destructive" onClick={() => setCancelOpen(true)}>
							<BanIcon />
							Zrušit rezervaci
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<CancelReservationDialog
				open={cancelOpen}
				onOpenChange={setCancelOpen}
				reservation={reservation}
			/>
		</>
	)
}
