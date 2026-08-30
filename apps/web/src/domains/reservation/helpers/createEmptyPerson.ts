import type { CreateReservationInput } from '@ski-blazek/api/schemas'
import { createEmptyEquipment } from './createEmptyEquipment'

export const createEmptyPerson = (): CreateReservationInput['people'][number] => ({
	name: '',
	age: 0,
	weight: 0,
	height: 0,
	gender: 'MALE',
	backProtection: false,
	bootCover: false,
	goggles: null,
	poles: null,
	skiCover: false,
	equipment: createEmptyEquipment(),
	level: null,
	note: null,
})
