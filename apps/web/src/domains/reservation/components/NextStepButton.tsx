import { nextStatus } from '@ski-blazek/api/schemas'
import type { ReservationStatus } from '@ski-blazek/db/browser'
import { Button } from '@ski-blazek/ui/components/button'
import { ArrowRightIcon } from 'lucide-react'
import { NEXT_STEP_ACTION_LABELS, RESERVATION_STATUS_META } from '../helpers/reservationStatus'

type NextStepButtonProps = {
	/** The person's or reservation's rolled-up status. */
	status: ReservationStatus
	/** The statuses of every item under it, cancelled ones included. */
	itemStatuses: ReservationStatus[]
	disabled: boolean
	onAdvance: () => void
}

/**
 * The one-click step for a whole person or reservation, plus how far its items
 * have got towards that step, e.g. "2/3 vyzvednuto". Hidden when there is no
 * next step (Returned, Cancelled) or no items to move.
 */
export const NextStepButton = ({
	status,
	itemStatuses,
	disabled,
	onAdvance,
}: NextStepButtonProps) => {
	const next = nextStatus(status)
	const items = itemStatuses.filter((itemStatus) => itemStatus !== 'CANCELLED')
	if (!next || items.length === 0) return null

	// The rolled-up status is the least advanced one, so any item not at it has
	// already reached `next` or gone past it.
	const done = items.filter((itemStatus) => itemStatus !== status).length

	return (
		<span className="flex items-center gap-2">
			<span className="text-muted-foreground text-sm">
				{done}/{items.length} {RESERVATION_STATUS_META[next].label.toLowerCase()}
			</span>
			<Button variant="outline" size="xs" disabled={disabled} onClick={onAdvance}>
				{NEXT_STEP_ACTION_LABELS[next]}
				<ArrowRightIcon data-icon="inline-end" />
			</Button>
		</span>
	)
}
