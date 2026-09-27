import { canCancel, canRemoveItem, type ReservationDetail } from '@ski-blazek/api/schemas'
import { EquipmentItemType } from '@ski-blazek/db/browser'

type SavedPerson = ReservationDetail['people'][number]

/**
 * What the edit form must not let staff change for a person, by the same rules
 * the API enforces: gear that has been picked up or returned can't be removed
 * or swapped, and a person holding any can't be removed. A person added in
 * this edit (not saved yet) has nothing locked.
 */
export const getPersonEditLocks = (saved: SavedPerson | undefined) => {
	if (!saved) return { lockedSlots: [], canRemove: true }

	const lockedSlots: EquipmentItemType[] = []
	for (const slot of Object.values(EquipmentItemType)) {
		const status = saved.slotStatuses[slot]
		if (status && !canRemoveItem(status)) lockedSlots.push(slot)
	}
	const canRemove = canCancel(saved.status, Object.values(saved.slotStatuses))
	return { lockedSlots, canRemove }
}
