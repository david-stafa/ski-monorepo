/**
 * Client-side utilities and types for Better Auth
 *
 * This file exports shared types and utilities that can be used
 * by both the web and mobile clients.
 */

import { createAuthClient } from 'better-auth/react'

interface AuthClientOptions {
  apiBaseUrl: string
}

export const createAuth = ({apiBaseUrl}: AuthClientOptions) => createAuthClient({
  baseURL: apiBaseUrl, // The base URL of your auth server,
  emailAndPassword: {
    enabled: true,
  },
})

// Re-export types from the server instance
// export type { Session } from "./index.js";
