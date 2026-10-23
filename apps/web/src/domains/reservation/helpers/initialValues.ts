import {
	type ReservationInput,
	seasonPickupDate,
	seasonReturnDeadline,
} from '@ski-blazek/api/schemas'
import { addDays, endOfDay, startOfDay } from 'date-fns'
import { createEmptyPerson, createPrefilledPeople, type PrefillPerson } from './createEmptyPerson'

export type InitialValuesProps = {
	name?: string
	phoneNumber?: string
	seasonal?: boolean
	people?: PrefillPerson[]
}

export const initialValues = ({
	name,
	phoneNumber,
	seasonal = false,
	people,
}: InitialValuesProps = {}): ReservationInput => {
	const today = startOfDay(new Date())
	const tomorrow = endOfDay(addDays(today, 1))

	return {
		name: name ?? '',
		phoneNumber: phoneNumber ?? '',
		startDate: seasonal ? seasonPickupDate(today) : today,
		endDate: seasonal ? seasonReturnDeadline(today) : tomorrow,
		seasonal,
		note: null,
		people: people ? createPrefilledPeople(people) : [createEmptyPerson()],
	}
}
