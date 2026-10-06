import { canCancel } from '@ski-blazek/api/schemas'
import { Button } from '@ski-blazek/ui/components/button'
import { Checkbox } from '@ski-blazek/ui/components/checkbox'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { BanIcon, EllipsisVerticalIcon } from 'lucide-react'
import { useState } from 'react'
import { getPersonAccessories } from '../helpers/getPersonAccessories'
import { LEVEL_LABELS } from '../helpers/levelMeta'
import { RESERVATION_STATUS_META } from '../helpers/reservationStatus'
import type { SheetStep } from '../helpers/sheetSteps'
import {
	getPersonUnits,
	type ReservationPerson,
	sortByHandOverOrder,
	statusRank,
} from '../helpers/stepUnits'
import { useAdvancePerson, useBulkStep, useUndoPerson } from '../reservationQueries'
import { CancelPersonDialog } from './CancelPersonDialog'
import { FlagsOrStatus } from './FlagBadges'
import { GenderIcon } from './GenderIcon'
import { StatusText } from './StatusText'
import { StepItemRow } from './StepItemRow'

type StepPersonBlockProps = {
	person: ReservationPerson
	step: SheetStep
}

/**
 * One person in the counter drawer: a checkbox for everything of theirs that
 * this sheet can move (none / some / all), then their gear, one row each.
 * Someone renting only accessories has no gear, so the checkbox moves them.
 */
export const StepPersonBlock = ({ person, step }: StepPersonBlockProps) => {
	const bulk = useBulkStep()
	const advance = useAdvancePerson()
	const undo = useUndoPerson()
	const [cancelOpen, setCancelOpen] = useState(false)

	const units = getPersonUnits(person)
	const accessoriesOnly = units[0]?.kind === 'person'
	// only what this sheet can move, e.g. Prepared ⇄ Picked up on Výdej
	const movable = units.filter((unit) => unit.status === step.from || unit.status === step.to)
	const notMoved = movable.filter((unit) => unit.status === step.from)
	const moved = movable.filter((unit) => unit.status === step.to)
	// not at this sheet's step yet (e.g. Booked boots on Výdej): the person
	// can't be fully ticked while one of these holds them back
	const waiting = units.filter((unit) => statusRank(unit.status) < statusRank(step.from))
	const all = movable.length > 0 && notMoved.length === 0 && waiting.length === 0
	const some = moved.length > 0 && !all

	// The tick shows where the click is going at once; if the API refuses,
	// the refetch puts it back.
	const [direction, setDirection] = useState<'forward' | 'back'>('forward')
	const isBusy = bulk.isPending || advance.isPending || undo.isPending
	const shownAll = isBusy ? direction === 'forward' && waiting.length === 0 : all
	const shownSome = isBusy ? direction === 'forward' && waiting.length > 0 : some

	const toggle = () => {
		// the rest goes forward; with nothing left to move, everything goes back
		const forward = notMoved.length > 0
		setDirection(forward ? 'forward' : 'back')
		// an accessories-only person is one thing moving, like an item: no toast.
		// `from` is the status on screen: if it's stale, the API refuses
		if (accessoriesOnly) {
			if (forward) advance.mutate({ id: person.id, from: person.status })
			else undo.mutate({ id: person.id, from: person.status })
		} else if (forward) {
			bulk.run({
				reservationId: person.reservationId,
				units: notMoved,
				direction: 'forward',
				title: `${RESERVATION_STATUS_META[step.to].label}: ${person.name} (${notMoved.length})`,
			})
		} else {
			bulk.run({
				reservationId: person.reservationId,
				units: moved,
				direction: 'back',
				title: `Vráceno na ${RESERVATION_STATUS_META[step.from].label}: ${person.name}`,
			})
		}
	}

	const items = sortByHandOverOrder(
		person.reservationItems.filter((item) => item.status !== 'CANCELLED')
	)
	const accessories = getPersonAccessories(person)
	const cancellable = canCancel(
		person.status,
		person.reservationItems.map((item) => item.status)
	)

	return (
		<div className="overflow-hidden rounded-lg border">
			{/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI's Checkbox renders its input inside */}
			<label className="bg-muted/40 flex min-h-14 cursor-pointer items-center gap-3 px-3 py-2">
				<Checkbox
					className="size-5"
					checked={shownAll}
					indeterminate={shownSome}
					disabled={movable.length === 0 || isBusy}
					onCheckedChange={toggle}
				/>
				<span className="min-w-0">
					<span className="flex gap-1 font-medium">
						<GenderIcon gender={person.gender} size={12} />
						{person.name}
					</span>
					<span className="text-muted-foreground block text-sm">
						{person.age} let · {person.height} cm · {person.weight} kg
						{person.level && ` · ${LEVEL_LABELS[person.level]}`}
					</span>
				</span>
				<span className="ml-auto flex items-center gap-1">
					{/* like an item row: while a click is on its way, where it's going */}
					{isBusy ? (
						<StatusText status={shownAll ? step.to : person.status} />
					) : (
						<FlagsOrStatus
							flags={person}
							direction="row"
							status={<StatusText status={person.status} />}
						/>
					)}
					{cancellable && (
						<DropdownMenu>
							<DropdownMenuTrigger
								render={<Button variant="ghost" size="icon-sm" aria-label="Další akce" />}
							>
								<EllipsisVerticalIcon />
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem variant="destructive" onClick={() => setCancelOpen(true)}>
									<BanIcon />
									Zrušit osobu
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</span>
			</label>

			{items.length > 0 && (
				<ul className="divide-y border-t">
					{items.map((item) => (
						<StepItemRow key={item.id} item={item} step={step} />
					))}
				</ul>
			)}

			{/* no status of their own: they go out and come back with the person */}
			{accessories.length > 0 && (
				<p className="text-muted-foreground border-t px-3 py-2 text-sm">
					+ {accessories.join(', ')}
				</p>
			)}
			{person.note && (
				<p className="text-muted-foreground border-t px-3 py-2 text-sm italic">{person.note}</p>
			)}

			<CancelPersonDialog open={cancelOpen} onOpenChange={setCancelOpen} person={person} />
		</div>
	)
}
