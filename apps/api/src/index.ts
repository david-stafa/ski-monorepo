import * as trpcExpress from '@trpc/server/adapters/express'
import { toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import express from 'express'
import { auth } from './auth'
import { PORT, WEB_URL } from './config'
import { appRouter } from './routers/_app'
import { createContext } from './routers/_context'

const app = express()

// Railway terminates TLS at its edge and forwards HTTP with X-Forwarded-*.
// `1` = trust exactly that one hop; `true` would trust a spoofed chain.
app.set('trust proxy', 1)

// Configure CORS middleware
app.use(
	cors({
		origin: WEB_URL, // Replace with your frontend's origin
		methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
		credentials: true, // Allow credentials (cookies, authorization headers, etc.)
	})
)

app.use(express.json())

app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(
	'/api/trpc',
	trpcExpress.createExpressMiddleware({
		router: appRouter,
		createContext,
	})
)

app.get('/health', (_req, res) => {
	res.status(200).json({
		status: 'ok',
		uptime: process.uptime(),
		timestamp: Date.now(),
	})
})

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}`)
})
