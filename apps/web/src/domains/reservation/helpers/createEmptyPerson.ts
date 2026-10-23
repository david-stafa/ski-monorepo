import { createEmptyEquipment, type ReservationInput } from '@ski-blazek/api/schemas'
import type { ReservationPerson } from './stepUnits'

/** The bits of an existing person worth copying into a new reservation. */
export type PrefillPerson = Pick<
	ReservationPerson,
	'name' | 'age' | 'weight' | 'height' | 'gender' | 'level'
>

export const createEmptyPerson = (): ReservationInput['people'][number] => ({
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

export const createPrefilledPeople = (people: PrefillPerson[]): ReservationInput['people'] => {
	return people.map((person) => {
		return {
			...createEmptyPerson(),
			name: person.name,
			age: person.age,
			weight: person.weight,
			height: person.height,
			gender: person.gender,
			level: person.level,
		}
	})
}
