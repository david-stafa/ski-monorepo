import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { z } from 'zod'

// Local dev reads the repo-root .env. On Railway the variables are injected
// into the process directly, so there is no file to find and this no-ops.
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const rootEnvFile = path.resolve(__dirname, '../../../.env')
if (existsSync(rootEnvFile)) dotenv.config({ path: rootEnvFile })

export const NODE_ENV = z
	.enum(['development', 'test', 'production'], {
		error: 'NODE_ENV must be one of: development, test, production',
	})
	.default('development')
	.parse(process.env.NODE_ENV)

export const IS_PRODUCTION = NODE_ENV === 'production'

export const PORT = z.coerce
	.number({ error: 'PORT must be a number' })
	.default(3001)
	.parse(process.env.PORT)

export const API_URL = z
	.url({ error: 'API_URL must be a valid URL, e.g. https://api.example.com' })
	.default('http://localhost:3001')
	.parse(process.env.API_URL)

export const WEB_URL = z
	.url({ error: 'WEB_URL must be a valid URL, e.g. https://rent.example.com' })
	.default('http://localhost:5174')
	.parse(process.env.WEB_URL)

export const FITTING_API_URL = z
	.url({ error: 'FITTING_API_URL must be a valid URL, e.g. https://rezervace.skiblazek.cz' })
	.default('http://localhost:3000')
	.parse(process.env.FITTING_API_URL)

export const FITTING_API_KEY = z
	.string()
	.min(1, 'FITTING_API_KEY must not be empty — unset the variable instead')
	.optional()
	.parse(process.env.FITTING_API_KEY || undefined)

// Shared parent of the api/web subdomains in production, e.g. `.railtest-app.fun`.
// Unset locally — both dev servers are on localhost and already share cookies.
// `|| undefined` so an empty Railway variable is treated as absent rather than
// enabling cross-subdomain cookies with a blank domain.
export const COOKIE_DOMAIN = z
	.string()
	.min(1, 'COOKIE_DOMAIN must not be empty — unset the variable instead')
	.optional()
	.parse(process.env.COOKIE_DOMAIN || undefined)

const secret = process.env.BETTER_AUTH_SECRET
if (IS_PRODUCTION && (!secret || secret.length < 32)) {
	throw new Error(
		'BETTER_AUTH_SECRET must be set to at least 32 characters in production. Generate one with `pnpx auth secret`.'
	)
}
