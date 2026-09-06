import type { ReservationInput } from '@ski-blazek/api/schemas'
import { addDays, endOfDay, startOfDay } from 'date-fns'
import { createEmptyPerson } from './createEmptyPerson'

const today = startOfDay(new Date())
const tomorrow = endOfDay(addDays(today, 1))

export const initialValues: ReservationInput = {
	name: '',
	phoneNumber: '',
	startDate: today,
	endDate: tomorrow,
	note: null,
	people: [createEmptyPerson()],
}
