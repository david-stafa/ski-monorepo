import { nextStatus } from '@ski-blazek/api/schemas'
import { Button } from '@ski-blazek/ui/components/button'
import { Checkbox } from '@ski-blazek/ui/components/checkbox'
import { cn } from '@ski-blazek/ui/lib/utils'
import { getEquipmentItemLabel } from '../helpers/getEquipmentItemLabel'
import { NEXT_STEP_ACTION_LABELS, RESERVATION_STATUS_META } from '../helpers/reservationStatus'
import type { SheetStep } from '../helpers/sheetSteps'
import { type ReservationItem, statusRank } from '../helpers/stepUnits'
import { useAdvanceReservationItem, useUndoReservationItem } from '../reservationQueries'
import { ItemFlagNote, isItemBehind } from './FlagBadges'
import { StatusText } from './StatusText'

type StepItemRowProps = {
	item: ReservationItem
	step: SheetStep
}

/**
 * One piece of gear on a counter sheet. Ticked means it has made this sheet's
 * step; unticking steps it back. Gear not yet at the step is greyed out as
 * "Nepřipraveno" (or "Nevyzvednuto" on Vrácení), with a button when it is only
 * the one step short; gear already past it is ticked and locked.
 */
export const StepItemRow = ({ item, step }: StepItemRowProps) => {
	const advance = useAdvanceReservationItem()
	const undo = useUndoReservationItem()
	const label = getEquipmentItemLabel(item.equipmentItem)
	const rank = statusRank(item.status)

	// not there yet, e.g. Booked boots on Výdej: offer the missing step
	if (rank < statusRank(step.from)) {
		const next = nextStatus(item.status)
		// anything further behind belongs on the detail page
		const oneStepShort = next === step.from
		return (
			<li className="flex min-h-12 items-center gap-3 px-3">
				<Checkbox className="size-5" disabled checked={false} />
				<span className="text-muted-foreground font-mono text-sm">{label}</span>
				<span className="ml-auto flex items-center gap-2">
					<span className="text-warning text-sm">
						Ne{RESERVATION_STATUS_META[step.from].label.toLowerCase()}
					</span>
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
			</li>
		)
	}

	// already past this sheet's step
	if (rank > statusRank(step.to)) {
		return (
			<li className="flex min-h-12 items-center gap-3 px-3">
				<Checkbox className="size-5" disabled checked />
				<span className="text-muted-foreground font-mono text-sm">{label}</span>
				<span className="ml-auto">
					<StatusText status={item.status} />
				</span>
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
					'flex min-h-12 cursor-pointer items-center gap-3 px-3 transition-colors',
					shownDone ? 'bg-primary/5' : 'hover:bg-muted/50'
				)}
			>
				<Checkbox
					className="size-5"
					checked={shownDone}
					disabled={isBusy}
					onCheckedChange={toggle}
				/>
				<span className={cn('font-mono text-sm', isItemBehind(item) && 'text-destructive')}>
					{label}
				</span>
				<ItemFlagNote item={item} />
				<span className="ml-auto">
					<StatusText status={shownDone ? step.to : step.from} />
				</span>
			</label>
		</li>
	)
}
