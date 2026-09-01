import { prisma } from '@ski-blazek/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'

interface AuthOptions {
	trustedOrigins: string[]
	/** e.g. https://your-caddy.up.railway.app — required behind a reverse proxy for cookies/links */
	apiURL: string
}

export const createAuth = ({ trustedOrigins, apiURL }: AuthOptions) =>
	betterAuth({
		baseURL: apiURL,
		database: prismaAdapter(prisma, {
			provider: 'postgresql',
		}),
		emailAndPassword: {
			enabled: true,
			disableSignUp: true,
		},
		trustedOrigins,
		plugins: [admin()],
	})
