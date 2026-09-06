import { EquipmentItemType } from '@ski-blazek/db/browser'
import z from 'zod'

export const equipmentIdInputSchema = z.object({
	id: z.string(),
})
export type EquipmentIdInput = z.infer<typeof equipmentIdInputSchema>

export const findAvailableInputSchema = z.object({
	type: z.enum(EquipmentItemType),
	startDate: z.date(),
	endDate: z.date(),
	// When editing a reservation, its own bookings must not count against it —
	// otherwise every item it already holds looks taken and drops out of the
	// picker. See overlappingActiveBooking.
	excludeReservationId: z.string().optional(),
})

export type FindAvailableInput = z.infer<typeof findAvailableInputSchema>

export const isItemAvailableInputSchema = z.object({
	id: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	excludeReservationId: z.string().optional(),
})

export type IsItemAvailableInput = z.infer<typeof isItemAvailableInputSchema>
