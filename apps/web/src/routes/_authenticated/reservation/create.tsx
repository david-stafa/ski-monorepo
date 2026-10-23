import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ReservationForm } from '~/domains/reservation/components/ReservationForm'

const createReservationSearch = z.object({
	name: z.string().optional(),
	phoneNumber: z.string().optional(),
	seasonal: z.boolean().optional(),
	fromReservation: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/reservation/create')({
	component: RouteComponent,
	validateSearch: createReservationSearch,
	loaderDeps: ({ search }) => ({ fromReservation: search.fromReservation }),
	loader: async ({ context, deps }) => {
		if (!deps.fromReservation) return null
		return context.queryClient.ensureQueryData(
			context.trpc.reservation.get.queryOptions({ id: deps.fromReservation })
		)
	},
})

function RouteComponent() {
	const searchParams = Route.useSearch()
	const sourceReservation = Route.useLoaderData()

	return (
		<ReservationForm
			searchParams={{
				...searchParams,
				name: sourceReservation?.name ?? searchParams.name,
				phoneNumber: sourceReservation?.phoneNumber ?? searchParams.phoneNumber,
				people: sourceReservation?.people,
			}}
		/>
	)
}
