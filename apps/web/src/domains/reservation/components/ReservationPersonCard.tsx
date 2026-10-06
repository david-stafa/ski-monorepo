import { canCancel, nextStatus, previousStatus } from '@ski-blazek/api/schemas'
import type { ReservationStatus } from '@ski-blazek/db/browser'
import { Badge } from '@ski-blazek/ui/components/badge'
import { Button } from '@ski-blazek/ui/components/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { cn } from '@ski-blazek/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, BanIcon, EllipsisVerticalIcon, Undo2Icon } from 'lucide-react'
import { useState } from 'react'
import { getPersonAccessories } from '../helpers/getPersonAccessories'
import { LEVEL_LABELS } from '../helpers/levelMeta'
import { RESERVATION_STATUS_META } from '../helpers/reservationStatus'
import {
	getPersonUnits,
	type ReservationItem,
	type ReservationPerson,
	sortByHandOverOrder,
} from '../helpers/stepUnits'
import {
	useAdvancePerson,
	useAdvanceReservationItem,
	useUndoPerson,
	useUndoReservationItem,
} from '../reservationQueries'
import { CancelPersonDialog } from './CancelPersonDialog'
import { EquipmentItemOptionLabel } from './EquipmentItemOptionLabel'
import { FlagsOrStatus } from './FlagBadges'
import { GenderIcon } from './GenderIcon'
import { StatusText } from './StatusText'

/**
 * One person on the detail page, the full record: every item with its status
 * as quiet text, cancelled ones struck through. Any single step, forward or
 * back, lives in the row's ⋯ menu.
 */
export const ReservationPersonCard = ({ person }: { person: ReservationPerson }) => {
	const [cancelOpen, setCancelOpen] = useState(false)
	const items = sortByHandOverOrder(person.reservationItems)
	const accessories = getPersonAccessories(person)
	// with no active gear (accessories only) staff move the person by hand
	const movedByHand = getPersonUnits(person)[0]?.kind === 'person'
	// only while nothing of theirs has been picked up
	const cancellable = canCancel(
		person.status,
		person.reservationItems.map((item) => item.status)
	)

	return (
		<div
			className={cn(
				'bg-background rounded-lg border',
				person.status === 'CANCELLED' && 'opacity-60'
			)}
		>
			<div className="flex min-h-12 flex-wrap items-center gap-2 px-3 py-2">
				<GenderIcon gender={person.gender} />
				<span className="font-medium">{person.name}</span>
				<span className="text-muted-foreground text-sm">
					{person.age} let · {person.height} cm · {person.weight} kg
				</span>
				{person.level && <Badge variant="outline">{LEVEL_LABELS[person.level]}</Badge>}
				<span className="ml-auto flex items-center gap-2">
					{/* status rolled up from their items by the API, or moved by hand without any */}
					<FlagsOrStatus
						flags={person}
						direction="row"
						status={<StatusText status={person.status} />}
					/>
					{(movedByHand || cancellable) && (
						<RowMenu>
							{movedByHand && <PersonStepItems person={person} />}
							{movedByHand && cancellable && <DropdownMenuSeparator />}
							{cancellable && (
								<DropdownMenuItem variant="destructive" onClick={() => setCancelOpen(true)}>
									<BanIcon />
									Zrušit osobu
								</DropdownMenuItem>
							)}
						</RowMenu>
					)}
				</span>
			</div>

			{items.length > 0 && (
				<ul className="divide-y border-t">
					{items.map((item) => (
						<ItemRow key={item.id} item={item} />
					))}
				</ul>
			)}

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

const ItemRow = ({ item }: { item: ReservationItem }) => (
	<li
		className={cn(
			'flex min-h-11 items-center gap-3 px-3',
			item.status === 'CANCELLED' && 'text-muted-foreground line-through'
		)}
	>
		<Link
			to="/equipment/$equipmentId"
			params={{ equipmentId: item.equipmentItem.id }}
			className="font-mono text-sm hover:underline"
		>
			<EquipmentItemOptionLabel item={item.equipmentItem} />
		</Link>
		<span className="ml-auto flex items-center gap-1">
			<FlagsOrStatus flags={item} direction="row" status={<StatusText status={item.status} />} />
			{item.status === 'CANCELLED' ? (
				// keeps the status column lined up with the rows that have a menu
				<span className="size-8" />
			) : (
				<RowMenu>
					<ItemStepItems item={item} />
				</RowMenu>
			)}
		</span>
	</li>
)

const RowMenu = ({ children }: { children: React.ReactNode }) => (
	<DropdownMenu>
		<DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Další akce" />}>
			<EllipsisVerticalIcon />
		</DropdownMenuTrigger>
		<DropdownMenuContent className="w-fit">{children}</DropdownMenuContent>
	</DropdownMenu>
)

/** "Posunout na …" and "Vrátit na …", whichever the status flow allows. */
const StepMenuItems = ({
	status,
	disabled,
	onAdvance,
	onUndo,
}: {
	status: ReservationStatus
	disabled: boolean
	onAdvance: () => void
	onUndo: () => void
}) => {
	const next = nextStatus(status)
	const previous = previousStatus(status)
	return (
		<>
			{next && (
				<DropdownMenuItem disabled={disabled} onClick={onAdvance}>
					<ArrowRightIcon />
					<p>
						Posunout na <b>{RESERVATION_STATUS_META[next].label}</b>
					</p>
				</DropdownMenuItem>
			)}
			{previous && (
				<DropdownMenuItem disabled={disabled} onClick={onUndo} className="w-full">
					<Undo2Icon />
					<p>
						Vrátit na <b>{RESERVATION_STATUS_META[previous].label}</b>
					</p>
				</DropdownMenuItem>
			)}
		</>
	)
}

// `from` is the status on screen: if it's stale, the API refuses

const ItemStepItems = ({ item }: { item: ReservationItem }) => {
	const advance = useAdvanceReservationItem()
	const undo = useUndoReservationItem()
	return (
		<StepMenuItems
			status={item.status}
			disabled={advance.isPending || undo.isPending}
			onAdvance={() => advance.mutate({ id: item.id, from: item.status })}
			onUndo={() => undo.mutate({ id: item.id, from: item.status })}
		/>
	)
}

const PersonStepItems = ({ person }: { person: ReservationPerson }) => {
	const advance = useAdvancePerson()
	const undo = useUndoPerson()
	return (
		<StepMenuItems
			status={person.status}
			disabled={advance.isPending || undo.isPending}
			onAdvance={() => advance.mutate({ id: person.id, from: person.status })}
			onUndo={() => undo.mutate({ id: person.id, from: person.status })}
		/>
	)
}
