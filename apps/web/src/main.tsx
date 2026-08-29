import '@ski-blazek/ui/globals.css'

// Import the generated route tree
import { Button } from '@ski-blazek/ui/components/button'
import { TypographyP } from '@ski-blazek/ui/components/typography'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { createRouter, Link, RouterProvider } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { Loader2Icon } from 'lucide-react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { queryClient } from './lib/trpc'
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({
	routeTree,
	defaultPendingMs: 1000,
	defaultPendingMinMs: 500,
	defaultPendingComponent: () => (
		<div className="bg-background flex h-full w-full items-center justify-center">
			<Loader2Icon className="text-primary size-10 animate-spin" />
		</div>
	),
	/* TODO: Add error component for production */
	defaultErrorComponent: ({ error }) => (
		<div className="text-foreground bg-background flex min-h-dvh flex-col justify-center p-4">
			<p className="text-destructive">{error.name}</p>
			<p className="text-destructive">{error.message}</p>
			<p className="text-muted-foreground text-sm">{error.stack}</p>
		</div>
	),
	defaultNotFoundComponent: () => (
		<div className="text-foreground bg-background flex min-h-dvh flex-col items-center justify-center gap-4">
			<TypographyP>Stránka nebyla nalezena...</TypographyP>
			<Button nativeButton={false} render={<Link to="/" />}>
				Domů
			</Button>
		</div>
	),
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

// biome-ignore lint/style/noNonNullAssertion: <.>
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
		{/* biome-ignore lint/suspicious/noUndeclaredEnvVars: DEV is a Vite compile-time constant, not a Turbo env var */}
		{import.meta.env.DEV && (
			<TanStackDevtools
				plugins={[
					{
						name: 'TanStack Query',
						render: <ReactQueryDevtoolsPanel client={queryClient} />,
					},
					{
						name: 'TanStack Router',
						render: <TanStackRouterDevtoolsPanel router={router} />,
					},
					{
						name: 'TanStack Form',
						render: <FormDevtoolsPanel />,
					},
				]}
			/>
		)}
	</StrictMode>
)
