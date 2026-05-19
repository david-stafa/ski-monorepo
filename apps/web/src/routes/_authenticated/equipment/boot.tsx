import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/equipment/boot')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/equipment/boots"!</div>
}
