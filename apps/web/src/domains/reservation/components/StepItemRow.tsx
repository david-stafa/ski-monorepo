import { nextStatus } from '@ski-blazek/api/schemas'
import type { EquipmentItemType, ReservationStatus } from '@ski-blazek/db/browser'
import { Button } from '@ski-blazek/ui/components/button'
import { Checkbox } from '@ski-blazek/ui/components/checkbox'
import { cn } from '@ski-blazek/ui/lib/utils'
import { ArticleNumberBadge } from '~/domains/equipment/_shared/components/badges/ArticleNumberBadge'
import { EquipmentItemBadges } from '~/domains/equipment/_shared/components/badges/EquipmentBadges'
import { EquipmentItemName } from '~/domains/equipment/_shared/components/EquipmentItemName'
import { NEXT_STEP_ACTION_LABELS } from '../helpers/reservationStatus'
import type { SheetStep } from '../helpers/sheetSteps'
import { type ReservationItem, statusRank } from '../helpers/stepUnits'
import { useAdvanceReservationItem, useUndoReservationItem } from '../reservationQueries'
import { FlagsOrStatus } from './FlagBadges'
import { ReservationStatusBadge } from './ReservationStatusBadge'

type StepItemRowProps = {
	item: ReservationItem
	step: SheetStep
}

/** What gear not yet at a sheet's step is waiting for. Worded unlike the Late
 * prep and Missed pickup flags, which it gives way to when the gear has one. */
const WAITING_LABELS: Partial<Record<ReservationStatus, string>> = {
	BOOKED: 'Čeká na přípravu',
	PREPARED: 'Čeká na výdej',
}

const EQUIPMENT_TYPE_LABELS: Record<EquipmentItemType, string> = {
	SKI: 'Lyže',
	SKI_BOOT: 'Lyžáky',
	SNOWBOARD: 'Snowboard',
	SNOWBOARD_BOOT: 'Boty snow.',
	HELMET: 'Helma',
}

/**
 * One piece of gear on a counter sheet. Ticked means it has made this sheet's
 * step; unticking steps it back. Gear not yet at the step is greyed out as
 * waiting ("Čeká na přípravu"), or shows its flag, with a button when it is
 * only the one step short; gear already past it is ticked and locked.
 */
export const StepItemRow = ({ item, step }: StepItemRowProps) => {
	const advance = useAdvanceReservationItem()
	const undo = useUndoReservationItem()
	const rank = statusRank(item.status)

	// not there yet, e.g. Booked boots on Výdej: offer the missing step
	if (rank < statusRank(step.from)) {
		const next = nextStatus(item.status)
		// anything further behind belongs on the detail page
		const oneStepShort = next === step.from
		return (
			<li className="flex items-center gap-3 px-3 py-3">
				<Checkbox className="size-5" disabled checked={false} />
				<StepItemDetails
					item={item.equipmentItem}
					muted
					aside={
						<span className="flex items-center gap-2">
							<FlagsOrStatus
								flags={item}
								direction="row"
								status={
									<span className="text-muted-foreground text-sm">
										{WAITING_LABELS[item.status]}
									</span>
								}
							/>
							{oneStepShort && (
								<Button
									variant="outline"
									size="sm"
									disabled={advance.isPending}
									onClick={() => advance.mutate({ id: item.id, from: item.status })}
								>
									{NEXT_STEP_ACTION_LABELS[step.from]}
								</Button>
							)}
						</span>
					}
				/>
			</li>
		)
	}

	// already past this sheet's step
	if (rank > statusRank(step.to)) {
		return (
			<li className="flex items-center gap-3 px-3 py-3">
				<Checkbox className="size-5" disabled checked />
				<StepItemDetails
					item={item.equipmentItem}
					aside={
						<FlagsOrStatus
							flags={item}
							direction="row"
							status={<ReservationStatusBadge status={item.status} />}
						/>
					}
				/>
			</li>
		)
	}

	const isBusy = advance.isPending || undo.isPending
	const done = item.status === step.to
	// While the click is on its way the row already shows where it's going; if
	// the API refuses, the refetch puts it back.
	const shownDone = isBusy ? !done : done
	const toggle = () => {
		// `from` is the status on screen: if it's stale, the API refuses
		if (done) undo.mutate({ id: item.id, from: item.status })
		else advance.mutate({ id: item.id, from: item.status })
	}

	return (
		<li>
			{/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI's Checkbox renders its input inside */}
			<label
				className={cn(
					'flex cursor-pointer items-center gap-3 px-3 py-3 transition-colors',
					shownDone ? 'bg-primary/5' : 'hover:bg-muted/50'
				)}
			>
				<Checkbox
					className="size-5"
					checked={shownDone}
					disabled={isBusy}
					onCheckedChange={toggle}
				/>
				<StepItemDetails
					item={item.equipmentItem}
					aside={
						// its flags are for where it was: while the click is on its way,
						// show where it's going, then whatever the API says
						isBusy ? (
							<ReservationStatusBadge status={shownDone ? step.to : step.from} />
						) : (
							<FlagsOrStatus
								flags={item}
								direction="row"
								status={<ReservationStatusBadge status={shownDone ? step.to : step.from} />}
							/>
						)
					}
				/>
			</label>
		</li>
	)
}

/**
 * The gear itself, laid out the same on every row. `aside` sits on the right of
 * the first line; `muted` greys out the gear (not the aside) for rows that are
 * still waiting.
 */
const StepItemDetails = ({
	item,
	aside,
	muted = false,
}: {
	item: ReservationItem['equipmentItem']
	aside: React.ReactNode
	muted?: boolean
}) => (
	<div className="flex w-full min-w-0 flex-col gap-2">
		<div className="flex items-start justify-between gap-3 md:items-center">
			<div
				className={cn('flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1', muted && 'opacity-60')}
			>
				<ArticleNumberBadge articleGroup={item.articleGroup} articleNumber={item.articleNumber} />
				<EquipmentItemName item={item} />
			</div>
			<div className="shrink-0">{aside}</div>
		</div>
		<div className={cn('flex flex-wrap items-center gap-2', muted && 'opacity-60')}>
			<span className="text-muted-foreground text-sm">{EQUIPMENT_TYPE_LABELS[item.type]}</span>
			<EquipmentItemBadges item={item} />
		</div>
	</div>
)
