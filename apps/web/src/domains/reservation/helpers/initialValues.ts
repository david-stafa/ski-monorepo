import type { ReservationInput } from '@ski-blazek/api/schemas'
import { addDays, endOfDay, startOfDay } from 'date-fns'
import { createEmptyPerson } from './createEmptyPerson'

export type InitialValuesProps = {
	name?: string
	phoneNumber?: string
}

export const initialValues = ({ name, phoneNumber }: InitialValuesProps = {}): ReservationInput => {
	const today = startOfDay(new Date())
	const tomorrow = endOfDay(addDays(today, 1))

	return {
		name: name ?? '',
		phoneNumber: phoneNumber ?? '',
		startDate: today,
		endDate: tomorrow,
		note: null,
		people: [createEmptyPerson()],
	}
}
