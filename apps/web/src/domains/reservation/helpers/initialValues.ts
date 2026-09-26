import { type ReservationInput, seasonReturnDeadline } from '@ski-blazek/api/schemas'
import { addDays, endOfDay, startOfDay } from 'date-fns'
import { createEmptyPerson } from './createEmptyPerson'

export type InitialValuesProps = {
	name?: string
	phoneNumber?: string
	seasonal?: boolean
}

export const initialValues = ({
	name,
	phoneNumber,
	seasonal = false,
}: InitialValuesProps = {}): ReservationInput => {
	const today = startOfDay(new Date())
	const tomorrow = endOfDay(addDays(today, 1))

	return {
		name: name ?? '',
		phoneNumber: phoneNumber ?? '',
		startDate: today,
		endDate: seasonal ? seasonReturnDeadline(today) : tomorrow,
		seasonal,
		note: null,
		people: [createEmptyPerson()],
	}
}
