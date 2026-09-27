import { nextStatus, previousStatus } from '@ski-blazek/api/schemas'
import { Button } from '@ski-blazek/ui/components/button'
import { ArrowRightIcon, Undo2Icon } from 'lucide-react'
import type { Outputs } from '~/lib/trpc'
import { getEquipmentItemLabel } from '../helpers/getEquipmentItemLabel'
import { RESERVATION_STATUS_META } from '../helpers/reservationStatus'
import { useAdvanceReservationItem, useUndoReservationItem } from '../reservationQueries'
import { ReservationStatusBadge } from './ReservationStatusBadge'

type ReservationItem = Outputs['reservation']['get']['people'][number]['reservationItems'][number]

type ReservationItemRowProps = {
	item: ReservationItem
}

/** One piece of gear with its status and the one-step forward / undo buttons.
 * Each button shows only when the status flow allows that step. */
export const ReservationItemRow = ({ item }: ReservationItemRowProps) => {
	const advance = useAdvanceReservationItem()
	const undo = useUndoReservationItem()
	const next = nextStatus(item.status)
	const previous = previousStatus(item.status)
	const isBusy = advance.isPending || undo.isPending

	return (
		<li className="flex flex-wrap items-center gap-2">
			<span className="font-mono text-sm">{getEquipmentItemLabel(item.equipmentItem)}</span>
			<ReservationStatusBadge status={item.status} />

			<div className="ml-auto flex gap-1">
				{previous && (
					<Button
						variant="ghost"
						size="xs"
						disabled={isBusy}
						title={`Vrátit zpět na „${RESERVATION_STATUS_META[previous].label}“`}
						// `from` is the status on screen: if it's stale, the API refuses
						onClick={() => undo.mutate({ id: item.id, from: item.status })}
					>
						<Undo2Icon data-icon="inline-start" />
						Zpět
					</Button>
				)}
				{next && (
					<Button
						variant="outline"
						size="xs"
						disabled={isBusy}
						onClick={() => advance.mutate({ id: item.id, from: item.status })}
					>
						{RESERVATION_STATUS_META[next].label}
						<ArrowRightIcon data-icon="inline-end" />
					</Button>
				)}
			</div>
		</li>
	)
}
