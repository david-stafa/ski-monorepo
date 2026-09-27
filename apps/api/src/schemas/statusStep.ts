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

/** One reservation item or person, and the status the staff member saw it in. */
const stepTargetSchema = z.object({ id: z.string(), from: z.enum(ReservationStatus) })

/**
 * Moves exactly the listed items of one reservation one step, forward or back,
 * all or nothing. `people` are those with no items (accessories only), whom
 * staff move by hand. Undoing a bulk step sends back the same targets with the
 * status they moved to as `from`, so it reverts exactly what the step moved.
 */
const hasNoDuplicateIds = (targets: { id: string }[]) =>
	new Set(targets.map((target) => target.id)).size === targets.length

export const reservationStepInputSchema = z.object({
	id: z.string(),
	direction: z.enum(['forward', 'back']),
	// each target moves once: listed twice it would pass the stale check twice
	items: z.array(stepTargetSchema).refine(hasNoDuplicateIds, 'Položka je uvedena dvakrát'),
	people: z.array(stepTargetSchema).refine(hasNoDuplicateIds, 'Osoba je uvedena dvakrát'),
})
export type ReservationStepInput = z.infer<typeof reservationStepInputSchema>
