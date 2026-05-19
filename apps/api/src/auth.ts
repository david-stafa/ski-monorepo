import { createAuth } from '@ski-blazek/auth'
import { API_URL, WEB_URL } from './config'

export const auth = createAuth({
  trustedOrigins: [WEB_URL],
  apiURL: API_URL,
})
