import { Button } from '@ski-blazek/ui/components/button'
import { ModeToggle } from '@ski-blazek/ui/components/mode-toggle'
import { TypographyH2 } from '@ski-blazek/ui/components/typography'
import {
  createFileRoute,
  useNavigate,
  useRouteContext,
} from '@tanstack/react-router'
import { useState } from 'react'

// import { HabitsOverview } from '~/domains/dashboard/components/HabitsOverview'
import { authClient } from '~/lib/auth'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useRouteContext({ from: '__root__' })
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onRequest: () => setIsLoading(true),
        onSuccess: () => {
          setIsLoading(false)
          navigate({ to: '/' })
        },
        onError: (ctx) => {
          setIsLoading(false)
          console.error(ctx.error.message)
        },
      },
    })
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-4 flex items-center justify-end gap-1">
        <ModeToggle />
        <Button
          onClick={handleSignOut}
          variant="secondary"
          disabled={isLoading}
        >
          {isLoading ? 'Signing out…' : 'Sign Out'}
        </Button>
      </div>
      <div className="mb-4 flex h-fit flex-col items-start justify-between md:flex-row">
        <TypographyH2>Welcome, {user?.name}.</TypographyH2>
      </div>
    </div>
  )
}
