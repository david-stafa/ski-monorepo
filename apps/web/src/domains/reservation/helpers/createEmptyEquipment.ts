import type { CreateReservationInput } from '@ski-blazek/api/schemas'

type PersonEquipment = CreateReservationInput['people'][number]['equipment']

/** Every equipment slot unassigned — used for new people and for wiping
 * selections that a date change may have invalidated. */
export const createEmptyEquipment = (): PersonEquipment => ({
	SKI: null,
	SKI_BOOT: null,
	SNOWBOARD: null,
	SNOWBOARD_BOOT: null,
	HELMET: null,
})
