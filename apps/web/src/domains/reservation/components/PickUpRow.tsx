import { Button } from '@ski-blazek/ui/components/button'
import { Skeleton } from '@ski-blazek/ui/components/skeleton'
import { TableCell, TableRow } from '@ski-blazek/ui/components/table'
import { useQuery } from '@tanstack/react-query'
import { ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'
import { formatDate } from '~/lib/format'
import { trpc } from '~/lib/trpc'
import type { ReservationListItem } from '../reservation.types'
import { PickUpPersonCard } from './PickUpPersonCard'
import { ReservationStatusBadge } from './ReservationStatusBadge'

/** Kept next to the header definition in the route — the detail cell spans all of them. */
const COLUMN_COUNT = 8

type PickUpRowProps = {
	reservation: ReservationListItem
}

export const PickUpRow = ({ reservation }: PickUpRowProps) => {
	const [isOpen, setIsOpen] = useState(false)

	// The full person + gear tree is only worth fetching for the rows an admin
	// actually opens, so it hangs off the expander rather than the list query.
	const { data, isPending } = useQuery(
		trpc.reservation.get.queryOptions({ id: reservation.id }, { enabled: isOpen })
	)

	// Cancelled people stay on the record but collect nothing.
	const people = data?.people.filter((person) => person.status === 'ACTIVE')

	return (
		<>
			<TableRow>
				<TableCell>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-expanded={isOpen}
						aria-label={isOpen ? 'Skrýt vybavení' : 'Zobrazit vybavení'}
						onClick={() => setIsOpen((open) => !open)}
					>
						<ChevronRightIcon className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
					</Button>
				</TableCell>
				<TableCell>{reservation.name}</TableCell>
				<TableCell>{reservation.phoneNumber}</TableCell>
				<TableCell>{formatDate(reservation.startDate)}</TableCell>
				<TableCell>{formatDate(reservation.endDate)}</TableCell>
				<TableCell>{reservation._count.people}</TableCell>
				<TableCell>{reservation._count.reservationItems}</TableCell>
				<TableCell>
					<ReservationStatusBadge status={reservation.status} />
				</TableCell>
			</TableRow>

			{isOpen && (
				<TableRow className="hover:bg-transparent">
					<TableCell colSpan={COLUMN_COUNT} className="bg-muted/40 p-4">
						{isPending || !people ? (
							<Skeleton className="h-24 w-full" />
						) : (
							<div className="space-y-3">
								{reservation.note && (
									<p className="text-sm">
										<span className="text-muted-foreground">Poznámka: </span>
										{reservation.note}
									</p>
								)}

								{people.length === 0 ? (
									<p className="text-muted-foreground text-sm">
										K této rezervaci nejsou přiřazeny žádné osoby.
									</p>
								) : (
									people.map((person) => <PickUpPersonCard key={person.id} person={person} />)
								)}
							</div>
						)}
					</TableCell>
				</TableRow>
			)}
		</>
	)
}
