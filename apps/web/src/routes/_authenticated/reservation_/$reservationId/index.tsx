import { canCancel, canEdit } from '@ski-blazek/api/schemas'
import { Badge } from '@ski-blazek/ui/components/badge'
import { Button } from '@ski-blazek/ui/components/button'
import { TypographyH1 } from '@ski-blazek/ui/components/typography'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon, BanIcon, PencilIcon } from 'lucide-react'
import { useState } from 'react'
import { ButtonLink } from '~/components/ui/button-link'
import { CancelReservationDialog } from '~/domains/reservation/components/CancelReservationDialog'
import { NextStepButton } from '~/domains/reservation/components/NextStepButton'
import { OverdueBadge } from '~/domains/reservation/components/OverdueBadge'
import { ReservationPersonCard } from '~/domains/reservation/components/ReservationPersonCard'
import { ReservationStatusBadge } from '~/domains/reservation/components/ReservationStatusBadge'
import { getPersonStepStatuses } from '~/domains/reservation/helpers/getPersonStepStatuses'
import { useAdvanceReservation } from '~/domains/reservation/reservationQueries'
import { formatDate } from '~/lib/format'
import { trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/reservation_/$reservationId/')({
	loader: async ({ context, params }) =>
		context.queryClient.ensureQueryData(
			context.trpc.reservation.get.queryOptions({ id: params.reservationId })
		),
	component: RouteComponent,
})

function RouteComponent() {
	const { reservationId } = Route.useParams()
	const router = useRouter()
	const canGoBack = useCanGoBack()
	const navigate = useNavigate()
	const advance = useAdvanceReservation()
	const [cancelOpen, setCancelOpen] = useState(false)

	const { data: reservation } = useSuspenseQuery(
		trpc.reservation.get.queryOptions({ id: reservationId })
	)

	const items = reservation.people.flatMap((person) => person.reservationItems)
	// Cancelled people stay on the page, but a step never moves them.
	const activePeople = reservation.people.filter((person) => person.status !== 'CANCELLED')
	// only while nothing on it has been picked up
	const cancellable = canCancel(reservation.status, [
		...reservation.people.map((person) => person.status),
		...items.map((item) => item.status),
	])

	// Back to the list as it was left — filters, page and search live in its
	// URL. Opened from a bookmark or a pasted link there is nothing to go back
	// to, so fall back to the plain list.
	const goBack = () => {
		if (canGoBack) router.history.back()
		else navigate({ to: '/reservation' })
	}

	return (
		<div>
			<Button variant="ghost" size="sm" className="mb-4" onClick={goBack}>
				<ArrowLeftIcon data-icon="inline-start" />
				Zpět
			</Button>

			{/*  Title, status and actions  */}
			<section className="mb-6 flex flex-wrap items-start justify-between gap-4">
				<div>
					<div className="mb-2 flex flex-wrap items-center gap-2">
						<TypographyH1>{reservation.name}</TypographyH1>
						{reservation.seasonal && <Badge variant="outline">Sezónní</Badge>}
						<ReservationStatusBadge status={reservation.status} />
						{reservation.overdue && <OverdueBadge />}
					</div>
					<p className="text-muted-foreground">
						{reservation.phoneNumber} · {formatDate(reservation.startDate)} –{' '}
						{formatDate(reservation.endDate)}
					</p>
				</div>

				<div className="flex items-center gap-2">
					{/* the whole family in one click; `from` is the status on screen */}
					<NextStepButton
						status={reservation.status}
						statuses={activePeople.flatMap(getPersonStepStatuses)}
						disabled={advance.isPending}
						onAdvance={() => advance.mutate({ id: reservation.id, from: reservation.status })}
					/>
					{canEdit(reservation.status) && (
						<ButtonLink
							to="/reservation/$reservationId/edit"
							params={{ reservationId: reservation.id }}
							variant="outline"
							size="sm"
						>
							<PencilIcon className="size-4" />
							Upravit
						</ButtonLink>
					)}
					{cancellable && (
						<Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
							<BanIcon className="size-4" />
							Zrušit rezervaci
						</Button>
					)}
				</div>
			</section>

			<CancelReservationDialog
				open={cancelOpen}
				onOpenChange={setCancelOpen}
				reservation={{
					...reservation,
					_count: { people: reservation.people.length, reservationItems: items.length },
				}}
			/>

			{reservation.note && (
				<p className="mb-4 text-sm">
					<span className="text-muted-foreground">Poznámka: </span>
					{reservation.note}
				</p>
			)}

			{/*  People — the whole record, cancelled ones included  */}
			<div className="space-y-3">
				{reservation.people.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						K této rezervaci nejsou přiřazeny žádné osoby.
					</p>
				) : (
					reservation.people.map((person) => (
						<ReservationPersonCard key={person.id} person={person} showCancelled />
					))
				)}
			</div>
		</div>
	)
}
