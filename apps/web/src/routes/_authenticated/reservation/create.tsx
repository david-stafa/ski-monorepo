import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ReservationForm } from '~/domains/reservation/components/ReservationForm'

const createReservationSearch = z.object({
	name: z.string().optional(),
	phoneNumber: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/reservation/create')({
	component: RouteComponent,
	validateSearch: createReservationSearch,
})

function RouteComponent() {
	const searchParams = Route.useSearch()

	return (
		<div>
			<ReservationForm searchParams={searchParams} />
		</div>
	)
}
