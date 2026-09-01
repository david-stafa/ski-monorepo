import { createAuth } from '@ski-blazek/auth'
import { API_URL, COOKIE_DOMAIN, WEB_URL } from './config'

export const auth = createAuth({
	trustedOrigins: [WEB_URL],
	baseURL: API_URL,
	cookieDomain: COOKIE_DOMAIN,
})
