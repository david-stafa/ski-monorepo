import { createFileRoute } from '@tanstack/react-router'
import { ReservationForm } from '~/domains/reservation/components/ReservationForm'

export const Route = createFileRoute('/_authenticated/reservation/create')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="m-2 rounded-xl p-2 md:m-4 md:p-4">
			<ReservationForm />
		</div>
	)
}
