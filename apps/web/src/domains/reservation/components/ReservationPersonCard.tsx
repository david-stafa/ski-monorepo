import { previousStatus } from '@ski-blazek/api/schemas'
import type { EquipmentItemType } from '@ski-blazek/db/browser'
import { Badge } from '@ski-blazek/ui/components/badge'
import { Button } from '@ski-blazek/ui/components/button'
import { Undo2Icon } from 'lucide-react'
import type { Outputs } from '~/lib/trpc'
import { getPersonAccessories } from '../helpers/getPersonAccessories'
import { getPersonStepStatuses } from '../helpers/getPersonStepStatuses'
import { LEVEL_LABELS } from '../helpers/levelMeta'
import { RESERVATION_STATUS_META } from '../helpers/reservationStatus'
import { useAdvancePerson, useUndoPerson } from '../reservationQueries'
import { GenderIcon } from './GenderIcon'
import { NextStepButton } from './NextStepButton'
import { ReservationItemRow } from './ReservationItemRow'
import { ReservationStatusBadge } from './ReservationStatusBadge'

type ReservationPerson = Outputs['reservation']['get']['people'][number]

/**
 * The order gear is handed over in, biggest item first. Items come back in
 * insertion order otherwise, which differs per person and makes the sheet
 * awkward to read down a column.
 */
const TYPE_ORDER: EquipmentItemType[] = ['SKI', 'SKI_BOOT', 'SNOWBOARD', 'SNOWBOARD_BOOT', 'HELMET']

type ReservationPersonCardProps = {
	person: ReservationPerson
}

export const ReservationPersonCard = ({ person }: ReservationPersonCardProps) => {
	const advance = useAdvancePerson()
	const undo = useUndoPerson()
	const isBusy = advance.isPending || undo.isPending
	// Cancelled items stay on the record but are not handed over.
	const items = person.reservationItems
		.filter((item) => item.status !== 'CANCELLED')
		.sort(
			(a, b) => TYPE_ORDER.indexOf(a.equipmentItem.type) - TYPE_ORDER.indexOf(b.equipmentItem.type)
		)
	const accessories = getPersonAccessories(person)
	// With no items to undo one by one (accessories only), staff undo the
	// person itself.
	const previous = items.length === 0 ? previousStatus(person.status) : undefined

	return (
		<div className="bg-background rounded-lg border p-3">
			<div className="mb-2 flex flex-wrap items-center gap-2">
				<GenderIcon gender={person.gender} />
				<span className="font-medium">{person.name}</span>
				<span className="text-muted-foreground text-sm">
					{person.age} let · {person.height} cm · {person.weight} kg
				</span>
				{person.level && <Badge variant="outline">{LEVEL_LABELS[person.level]}</Badge>}
				{/* rolled up from their items by the API, or moved by hand without any */}
				<span className="ml-auto flex items-center gap-2">
					{previous && (
						<Button
							variant="ghost"
							size="xs"
							disabled={isBusy}
							title={`Vrátit zpět na „${RESERVATION_STATUS_META[previous].label}“`}
							// `from` is the status on screen: if it's stale, the API refuses
							onClick={() => undo.mutate({ id: person.id, from: person.status })}
						>
							<Undo2Icon data-icon="inline-start" />
							Zpět
						</Button>
					)}
					<NextStepButton
						status={person.status}
						statuses={getPersonStepStatuses(person)}
						disabled={isBusy}
						// `from` is the status on screen: if it's stale, the API refuses
						onAdvance={() => advance.mutate({ id: person.id, from: person.status })}
					/>
					<ReservationStatusBadge status={person.status} />
				</span>
			</div>

			{items.length === 0 ? (
				<p className="text-muted-foreground text-sm">Této osobě není přiřazeno žádné vybavení.</p>
			) : (
				<ul className="space-y-1">
					{items.map((item) => (
						<ReservationItemRow key={item.id} item={item} />
					))}
				</ul>
			)}

			{accessories.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-1">
					{accessories.map((accessory) => (
						<Badge key={accessory} variant="secondary">
							{accessory}
						</Badge>
					))}
				</div>
			)}

			{person.note && <p className="text-muted-foreground mt-2 text-sm italic">{person.note}</p>}
		</div>
	)
}
