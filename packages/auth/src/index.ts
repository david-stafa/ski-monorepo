import { prisma } from '@ski-blazek/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'

interface AuthOptions {
	trustedOrigins: string[]
	/**
	 * Public origin of this API, e.g. https://api.railtest-app.fun. Also decides
	 * whether cookies are marked Secure — better-auth reads the protocol.
	 */
	baseURL: string
	/**
	 * Registrable domain shared by the web and api subdomains, e.g.
	 * `.railtest-app.fun`. Widens the session cookie from host-only to the whole
	 * domain. Leave unset locally: both dev servers are on `localhost`, and
	 * cookies ignore ports, so they are already shared.
	 *
	 * Must NOT be a public suffix — `.up.railway.app` is on the Public Suffix
	 * List, so browsers silently drop a cookie scoped to it.
	 */
	cookieDomain?: string
}

export const createAuth = ({ trustedOrigins, baseURL, cookieDomain }: AuthOptions) =>
	betterAuth({
		baseURL,
		database: prismaAdapter(prisma, {
			provider: 'postgresql',
		}),
		emailAndPassword: {
			enabled: true,
			disableSignUp: true,
		},
		trustedOrigins,
		plugins: [admin()],
		// Only the domain needs stating. better-auth's defaults are already right
		// for this setup: sameSite lax (rent.* -> api.* is same-site, so lax still
		// sends the cookie), httpOnly, path '/', and Secure inferred from baseURL.
		advanced: cookieDomain
			? { crossSubDomainCookies: { enabled: true, domain: cookieDomain } }
			: undefined,
	})
