import { router } from './_context'
import { equipmentRouter } from './equipment/equipment'
import { reservationRouter } from './reservation/reservation'

export const appRouter = router({
  equipment: equipmentRouter,
  reservation: reservationRouter,
})

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter
