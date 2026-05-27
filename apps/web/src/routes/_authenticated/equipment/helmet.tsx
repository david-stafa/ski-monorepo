import { getHelmetInputSchema } from '@ski-blazek/api/schemas'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/equipment/helmet')({
  validateSearch: getHelmetInputSchema,
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/equipment/helmet"!</div>
}
