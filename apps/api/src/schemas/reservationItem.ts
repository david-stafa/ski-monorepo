import { ReservationStatus } from '@ski-blazek/db/browser'
import z from 'zod'

/**
 * Moves one reservation item one step. `from` is the status the staff member
 * was looking at when they clicked: the move only happens if the item is still
 * in it, so a double click or two people clicking at once moves it just once.
 */
export const reservationItemStepInputSchema = z.object({
	id: z.string(),
	from: z.enum(ReservationStatus),
})
export type ReservationItemStepInput = z.infer<typeof reservationItemStepInputSchema>
