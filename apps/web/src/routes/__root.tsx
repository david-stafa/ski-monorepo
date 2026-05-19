import { ThemeProvider } from '@ski-blazek/ui/components/theme-provider'
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'
import { authClient } from '~/lib/auth'
import { TooltipProvider } from '@ski-blazek/ui/components/tooltip'
import { Toaster } from '@ski-blazek/ui/components/sonner'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const { data } = await authClient.getSession()

    return {
      session: data?.session || null,
      user: data?.user || null,
    }
  },
  component: RootLayout,
  notFoundComponent: () => <div>404 Not Found</div>,
})

function RootLayout() {
  return (
    <Wrapper>
      <div>
        <Toaster />
        <Outlet />
      </div>
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
