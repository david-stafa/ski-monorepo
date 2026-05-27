import { getSkiBootInputSchema } from '@ski-blazek/api/schemas'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/equipment/ski-boot')({
  validateSearch: getSkiBootInputSchema,
  component: RouteComponent,
  
})

function RouteComponent() {
  return <div>Hello "/_authenticated/equipment/ski-boot"!</div>
}
