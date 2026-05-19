import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@ski-blazek/db'

interface AuthOptions {
  trustedOrigins: string[]
  /** e.g. https://your-caddy.up.railway.app — required behind a reverse proxy for cookies/links */
  apiURL: string
}

export const createAuth = ({ trustedOrigins, apiURL }: AuthOptions) =>
  betterAuth({
    apiURL,
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins,
  })

// Export types for use in client and server
// export type Session = typeof auth.$Infer.Session

// TODO: Check with Béďos if this is the correct way to export the helper
export { toNodeHandler, fromNodeHeaders } from 'better-auth/node'
