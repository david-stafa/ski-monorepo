import { router } from './_context'
import { equipmentRouter } from './equipment/equipment'

export const appRouter = router({
  equipment: equipmentRouter,
})

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter
