import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ReservationForm } from '~/domains/reservation/components/ReservationForm'
import { trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/reservation_/$reservationId/edit')({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(
			context.trpc.reservation.getForEdit.queryOptions({ id: params.reservationId })
		),
	component: RouteComponent,
})

function RouteComponent() {
	const { reservationId } = Route.useParams()

	const { data: reservation } = useSuspenseQuery(
		trpc.reservation.getForEdit.queryOptions({ id: reservationId })
	)

	return (
		<div>
			<ReservationForm reservation={reservation} />
		</div>
	)
}
