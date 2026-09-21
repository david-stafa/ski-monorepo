import { router } from './_context'
import { equipmentRouter } from './equipment/equipment'
import { fittingRouter } from './fitting/fitting'
import { personRouter } from './person/person'
import { reservationRouter } from './reservation/reservation'

export const appRouter = router({
	equipment: equipmentRouter,
	reservation: reservationRouter,
	person: personRouter,
	fitting: fittingRouter,
})

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter
