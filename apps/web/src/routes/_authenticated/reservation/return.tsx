import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/reservation/return')({
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Coming soon...</div>
}
