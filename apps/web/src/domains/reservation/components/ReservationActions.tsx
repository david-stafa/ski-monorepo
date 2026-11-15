import { canEdit } from '@ski-blazek/api/schemas'
import { Button } from '@ski-blazek/ui/components/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { BanIcon, EllipsisVerticalIcon, PencilIcon, PlusCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { trpc } from '~/lib/trpc'
import type { ReservationListItem } from '../reservation.types'
import { CancelReservationDialog } from './CancelReservationDialog'
import { PrefillReservationDialog } from './PrefillReservationDialog'

type ReservationActionsProps = {
	reservation: ReservationListItem
}

export const ReservationActions = ({ reservation }: ReservationActionsProps) => {
	const [cancelOpen, setCancelOpen] = useState(false)
	const [prefillOpen, setPrefillOpen] = useState(false)

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button variant="default" size="icon-sm" />}>
					<EllipsisVerticalIcon />
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-fit">
					{/* PREFILL — from any reservation, cancelled ones too */}
					<DropdownMenuItem onClick={() => setPrefillOpen(true)}>
						<PlusCircleIcon />
						Vytvořit předvyplněnou rezervaci
					</DropdownMenuItem>
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

			{/* mounted only while open, so each open starts from the default selection */}
			{prefillOpen && (
				<RowPrefillDialog reservationId={reservation.id} onClose={() => setPrefillOpen(false)} />
			)}
		</>
	)
}

type RowPrefillDialogProps = {
	reservationId: string
	onClose: () => void
}

/**
 * A list row has no people's details (name, age, height…), so the dialog
 * loads the reservation the detail page shows, and opens once it's here.
 */
const RowPrefillDialog = ({ reservationId, onClose }: RowPrefillDialogProps) => {
	const { data: reservation } = useQuery(trpc.reservation.get.queryOptions({ id: reservationId }))

	if (!reservation) return null

	return (
		<PrefillReservationDialog
			open
			onOpenChange={(open) => {
				if (!open) onClose()
			}}
			reservation={reservation}
		/>
	)
}
