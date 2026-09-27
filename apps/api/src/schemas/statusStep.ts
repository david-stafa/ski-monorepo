import { ReservationStatus } from '@ski-blazek/db/browser'
import z from 'zod'

/**
 * Moves a reservation item, a person or a reservation one step. `from` is the
 * status the staff member was looking at when they clicked: the move only
 * happens if it is still in it, so a double click or two people clicking at
 * once moves it just once.
 */
export const statusStepInputSchema = z.object({
	id: z.string(),
	from: z.enum(ReservationStatus),
})
export type StatusStepInput = z.infer<typeof statusStepInputSchema>
