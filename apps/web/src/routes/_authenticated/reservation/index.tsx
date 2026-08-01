import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/reservation/')({
  component: RouteComponent,
  loader: () => {
    throw redirect({ to: '/reservation/create' })
  },
})

function RouteComponent() {
  return (
    <div className="m-2 rounded-xl p-2 md:m-4 md:p-4">
      Hello from "/_authenticated/reservation/"!
    </div>
  )
}
