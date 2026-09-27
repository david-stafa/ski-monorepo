import { canEdit } from '@ski-blazek/api/schemas'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ReservationForm } from '~/domains/reservation/components/ReservationForm'
import { trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/reservation_/$reservationId/edit')({
	loader: async ({ context, params }) => {
		const reservation = await context.queryClient.ensureQueryData(
			context.trpc.reservation.getForEdit.queryOptions({ id: params.reservationId })
		)
		// Returned or Cancelled is read-only; the list hides the link, this
		// catches a typed-in or bookmarked URL
		if (!canEdit(reservation.status)) throw redirect({ to: '/reservation' })
		return reservation
	},
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
