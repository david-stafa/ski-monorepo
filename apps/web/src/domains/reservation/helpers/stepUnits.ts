import type { ReservationStepInput } from '@ski-blazek/api/schemas'
import { STATUS_STEPS } from '@ski-blazek/api/schemas'
import type { EquipmentItemType, ReservationStatus } from '@ski-blazek/db/browser'
import type { Outputs } from '~/lib/trpc'

export type ReservationDetail = Outputs['reservation']['get']
export type ReservationPerson = ReservationDetail['people'][number]
export type ReservationItem = ReservationPerson['reservationItems'][number]

/**
 * Something with a status of its own that a step moves: a reservation item,
 * or a person with no items (accessories only), whom staff move by hand.
 */
export type StepUnit = { kind: 'item' | 'person'; id: string; status: ReservationStatus }

/** Where a status sits in the flow; Cancelled is outside it (-1). */
export const statusRank = (status: ReservationStatus) => STATUS_STEPS.indexOf(status)

/** A person's step units: their items that are not cancelled, or the person
 * themself when they have none. A cancelled person has nothing to move. */
export const getPersonUnits = (person: ReservationPerson): StepUnit[] => {
	if (person.status === 'CANCELLED') return []
	const items = person.reservationItems.filter((item) => item.status !== 'CANCELLED')
	if (items.length === 0) return [{ kind: 'person', id: person.id, status: person.status }]
	return items.map((item) => ({ kind: 'item', id: item.id, status: item.status }))
}

/** The `reservation.step` input that moves these units in `direction`. `from`
 * is each unit's status on screen, so a stale page changes nothing. */
export const toStepInput = (
	reservationId: string,
	direction: ReservationStepInput['direction'],
	units: StepUnit[]
): ReservationStepInput => ({
	id: reservationId,
	direction,
	items: units
		.filter((unit) => unit.kind === 'item')
		.map((unit) => ({ id: unit.id, from: unit.status })),
	people: units
		.filter((unit) => unit.kind === 'person')
		.map((unit) => ({ id: unit.id, from: unit.status })),
})

/**
 * The order gear is handed over in, biggest item first. Items come back in
 * insertion order otherwise, which differs per person and makes a sheet
 * awkward to read down a column.
 */
const TYPE_ORDER: EquipmentItemType[] = ['SKI', 'SKI_BOOT', 'SNOWBOARD', 'SNOWBOARD_BOOT', 'HELMET']

export const sortByHandOverOrder = <T extends { equipmentItem: { type: EquipmentItemType } }>(
	items: T[]
) =>
	[...items].sort(
		(a, b) => TYPE_ORDER.indexOf(a.equipmentItem.type) - TYPE_ORDER.indexOf(b.equipmentItem.type)
	)

/** "položka / položky / položek" for a count. */
export const itemsWord = (count: number) =>
	count === 1 ? 'položka' : count >= 2 && count <= 4 ? 'položky' : 'položek'
