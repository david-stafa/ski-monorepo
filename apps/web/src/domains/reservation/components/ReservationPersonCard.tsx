import { canCancel, nextStatus, previousStatus } from '@ski-blazek/api/schemas'
import type { ReservationStatus } from '@ski-blazek/db/browser'
import { Button } from '@ski-blazek/ui/components/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { cn } from '@ski-blazek/ui/lib/utils'
import { ArrowRightIcon, BanIcon, EllipsisVerticalIcon, Undo2Icon } from 'lucide-react'
import { useState } from 'react'
import { EquipmentItemDetails } from '~/domains/equipment/_shared/components/EquipmentItemDetails'
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
import { FlagsOrStatus } from './FlagBadges'
import { GenderIcon } from './GenderIcon'
import { Note } from './Note'
import { ReservationStatusBadge } from './ReservationStatusBadge'

/**
 * One person on the detail page, the full record: every item with its flag or
 * status badge, cancelled ones struck through. Any single step, forward or
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
				'rounded-2xl border bg-background',
				person.status === 'CANCELLED' && 'opacity-60'
			)}
		>
			<div className="flex min-h-12 flex-wrap items-center gap-2 px-3 py-4">
				<GenderIcon gender={person.gender} />
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-lg">{person.name}</span>
					<span className="text-muted-foreground text-sm">
						{person.age} let · {person.height} cm · {person.weight} kg
						{person.level && ` · ${LEVEL_LABELS[person.level]}`}
					</span>
				</div>
				<span className="ml-auto flex items-center gap-2">
					{/* with gear, each item shows its own flag or status below, so the person's
					    would only repeat it; shown just when moved by hand */}
					{movedByHand && (
						<FlagsOrStatus
							flags={person}
							direction="row"
							status={<ReservationStatusBadge status={person.status} />}
						/>
					)}
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

			{person.note && <Note note={person.note} className="border-t px-3 py-2.5" />}

			{items.length > 0 && (
				<ul className="divide-y border-t">
					{items.map((item) => (
						<ItemRow key={item.id} item={item} />
					))}
				</ul>
			)}

			{/* no status or menu of their own: they go out and come back with the person */}
			{accessories.length > 0 && (
				<div className="flex flex-col gap-2 border-t px-4 py-3">
					<p className="flex items-baseline gap-2 font-semibold text-muted-foreground text-xs tracking-wide">
						DOPLŇKY
					</p>
					<ul className="flex flex-wrap gap-2">
						{accessories.map((accessory) => (
							<li
								key={accessory}
								className="flex items-center gap-1.5 rounded-md border bg-muted px-2.5 py-1.5 font-medium text-[13px] leading-none"
							>
								{accessory}
							</li>
						))}
					</ul>
				</div>
			)}

			<CancelPersonDialog open={cancelOpen} onOpenChange={setCancelOpen} person={person} />
		</div>
	)
}

const ItemRow = ({ item }: { item: ReservationItem }) => {
	const cancelled = item.status === 'CANCELLED'

	return (
		<li className="px-4 py-3">
			<EquipmentItemDetails
				item={item.equipmentItem}
				muted={cancelled}
				struck={cancelled}
				linked
				aside={
					<span className="flex items-center gap-1">
						<FlagsOrStatus
							flags={item}
							direction="row"
							status={<ReservationStatusBadge status={item.status} />}
						/>
						{cancelled ? (
							// keeps the status column lined up with the rows that have a menu
							<span className="size-8" />
						) : (
							<RowMenu>
								<ItemStepItems item={item} />
							</RowMenu>
						)}
					</span>
				}
			/>
		</li>
	)
}

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
