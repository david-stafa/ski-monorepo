import { createFileRoute, redirect } from '@tanstack/react-router'
import { RootPage } from '~/domains/root/RootPage'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    if (context.user) {
      console.log('user', context.user)
      throw redirect({
        to: '/dashboard',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: RootPage,
})
