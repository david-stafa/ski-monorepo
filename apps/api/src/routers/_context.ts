import { initTRPC, TRPCError } from '@trpc/server'
import type * as trpcExpress from '@trpc/server/adapters/express'
import { fromNodeHeaders } from 'better-auth/node'
import superjson from 'superjson'
import { auth } from '../auth'

// created for each request
export const createContext = async ({ req }: trpcExpress.CreateExpressContextOptions) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	})
	return { user: session?.user ?? null }
}

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create({
	transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = publicProcedure.use(async (opts) => {
	const { ctx } = opts

	if (!ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED' })
	}
	return opts.next({
		ctx: {
			user: ctx.user,
		},
	})
})
