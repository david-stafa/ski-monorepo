import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import type { AppRouter } from '@ski-blazek/api/trpc'
import type { inferRouterOutputs } from '@trpc/server'

export const queryClient = new QueryClient()

const apiOrigin =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001'
const trpcUrl = `${apiOrigin.replace(/\/$/, '')}/api/trpc`

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: trpcUrl,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        })
      },
    }),
  ],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
})

export type Outputs = inferRouterOutputs<AppRouter>
