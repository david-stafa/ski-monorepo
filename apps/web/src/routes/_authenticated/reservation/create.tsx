import { createFileRoute } from '@tanstack/react-router'
import { ReservationForm } from '~/domains/reservation/components/ReservationForm'

export const Route = createFileRoute('/_authenticated/reservation/create')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div>
			<ReservationForm />
		</div>
	)
}
