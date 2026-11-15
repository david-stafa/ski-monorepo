import { Button } from '@ski-blazek/ui/components/button'
import { Checkbox } from '@ski-blazek/ui/components/checkbox'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@ski-blazek/ui/components/dialog'
import { Label } from '@ski-blazek/ui/components/label'
import { cn } from '@ski-blazek/ui/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { PlusCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { formatPhone } from '~/lib/format'
import type { ReservationDetail } from '../helpers/stepUnits'
import { GenderIcon } from './GenderIcon'

type PrefillReservationDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	reservation: Pick<ReservationDetail, 'id' | 'name' | 'phoneNumber' | 'status' | 'people'>
}

/**
 * Who's ticked when the dialog opens — everyone still on the reservation. A
 * cancelled reservation took its people down with it, so there it's everyone.
 */
const defaultSelection = (reservation: Pick<ReservationDetail, 'status' | 'people'>) => {
	const people =
		reservation.status === 'CANCELLED'
			? reservation.people
			: reservation.people.filter((person) => person.status !== 'CANCELLED')
	return new Set(people.map(({ id }) => id))
}

/**
 * The step between "Vytvořit předvyplněnou rezervaci" and the form: the
 * customer's name and phone always carry over, the people are picked here —
 * any of them, all, or none.
 */
export const PrefillReservationDialog = ({
	open,
	onOpenChange,
	reservation,
}: PrefillReservationDialogProps) => {
	const navigate = useNavigate()
	// set once per open: the detail page mounts this only while it's open
	const [selected, setSelected] = useState(() => defaultSelection(reservation))

	const allSelected = selected.size === reservation.people.length
	const noneSelected = selected.size === 0

	const toggle = (id: string, checked: boolean) =>
		setSelected((prev) => {
			const next = new Set(prev)
			if (checked) next.add(id)
			else next.delete(id)
			return next
		})

	const handleConfirm = () => {
		onOpenChange(false)
		navigate({
			to: '/reservation/create',
			search: {
				fromReservation: reservation.id,
				personIds: [...selected],
			},
		})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Vytvořit předvyplněnou rezervaci</DialogTitle>
					<DialogDescription>
						Jméno a telefon se převezmou vždy. Vyberte osoby, jejichž údaje chcete předvyplnit.
					</DialogDescription>
				</DialogHeader>

				<div className="text-sm">
					<p className="font-medium">{reservation.name}</p>
					<p className="text-muted-foreground">{formatPhone(reservation.phoneNumber)}</p>
				</div>

				{reservation.people.length > 0 && (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="font-medium text-sm">
								Osoby ({selected.size}/{reservation.people.length})
							</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									setSelected(
										allSelected ? new Set() : new Set(reservation.people.map(({ id }) => id))
									)
								}
							>
								{allSelected ? 'Zrušit výběr' : 'Vybrat vše'}
							</Button>
						</div>

						<ul className="max-h-80 space-y-1 overflow-y-auto">
							{reservation.people.map((person) => {
								const id = `prefill-person-${person.id}`
								return (
									<li key={person.id}>
										<Label
											htmlFor={id}
											className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted"
										>
											<Checkbox
												id={id}
												checked={selected.has(person.id)}
												onCheckedChange={(checked) => toggle(person.id, checked === true)}
											/>
											<GenderIcon gender={person.gender} size={14} />
											<span
												className={cn(
													'flex-1 font-medium',
													person.status === 'CANCELLED' && 'text-muted-foreground line-through'
												)}
											>
												{person.name}
											</span>
											<span className="text-muted-foreground text-xs tabular-nums">
												{person.age} let · {person.height} cm · {person.weight} kg
											</span>
										</Label>
									</li>
								)
							})}
						</ul>
					</div>
				)}

				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>Zpět</DialogClose>
					<Button onClick={handleConfirm}>
						<PlusCircleIcon className="size-4" />
						{noneSelected ? 'Pokračovat bez osob' : 'Pokračovat'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
