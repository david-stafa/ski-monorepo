import { createFileRoute } from '@tanstack/react-router'
import { LogInPage } from '~/domains/auth/LogInPage'

export const Route = createFileRoute('/login')({
  component: LogInPage,
})
