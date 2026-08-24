import { ThemeProvider } from '@ski-blazek/ui/components/theme-provider'
import { Toaster } from '@ski-blazek/ui/components/toast'
import { TooltipProvider } from '@ski-blazek/ui/components/tooltip'
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'
import { authClient } from '~/lib/auth'
import { queryClient, trpc } from '~/lib/trpc'

export const Route = createRootRoute({
	beforeLoad: async () => {
		const { data } = await authClient.getSession()

		return {
			queryClient: queryClient,
			trpc: trpc,
			session: data?.session || null,
			user: data?.user || null,
		}
	},
	component: RootLayout,
})

function RootLayout() {
	return (
		<Wrapper>
			<Toaster>
				<Outlet />
			</Toaster>
		</Wrapper>
	)
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
	<>
		<HeadContent />
		<ThemeProvider>
			<TooltipProvider>{children}</TooltipProvider>
			{/* <TanStackRouterDevtools />
      <ReactQueryDevtools /> */}
		</ThemeProvider>
	</>
)
