import { canCancel, canEdit, nextStatus } from '@ski-blazek/api/schemas'
import { Badge } from '@ski-blazek/ui/components/badge'
import { Button } from '@ski-blazek/ui/components/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { TypographyH1 } from '@ski-blazek/ui/components/typography'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BanIcon,
	EllipsisVerticalIcon,
	PencilIcon,
} from 'lucide-react'
import { useState } from 'react'
import { CancelReservationDialog } from '~/domains/reservation/components/CancelReservationDialog'
import { OverdueBadge } from '~/domains/reservation/components/OverdueBadge'
import { ReservationPersonCard } from '~/domains/reservation/components/ReservationPersonCard'
import { ReservationStepper } from '~/domains/reservation/components/ReservationStepper'
import {
	NEXT_STEP_ACTION_LABELS,
	RESERVATION_STATUS_META,
} from '~/domains/reservation/helpers/reservationStatus'
import { getPersonUnits, itemsWord } from '~/domains/reservation/helpers/stepUnits'
import { useBulkStep } from '~/domains/reservation/reservationQueries'
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
	const bulk = useBulkStep()
	const [cancelOpen, setCancelOpen] = useState(false)

	const { data: reservation } = useSuspenseQuery(
		trpc.reservation.get.queryOptions({ id: reservationId })
	)

	const items = reservation.people.flatMap((person) => person.reservationItems)
	// Cancelled people stay on the page, but a step never moves them.
	const units = reservation.people.flatMap(getPersonUnits)
	// "→ … vše" moves what holds the family back: everything at its rolled-up
	// status, so what's further along is left alone and nothing skips a step
	const next = nextStatus(reservation.status)
	const toMove = units.filter((unit) => unit.status === reservation.status)
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

			{/*  Title, Overdue as the one loud badge, the one primary action  */}
			<section className="mb-6 flex flex-wrap items-start justify-between gap-4">
				<div>
					<div className="mb-2 flex flex-wrap items-center gap-2">
						<TypographyH1>{reservation.name}</TypographyH1>
						{reservation.seasonal && <Badge variant="outline">Sezónní</Badge>}
						{reservation.overdue && <OverdueBadge />}
					</div>
					<p className="text-muted-foreground">
						{reservation.phoneNumber} · {formatDate(reservation.startDate)} –{' '}
						{formatDate(reservation.endDate)}
					</p>
				</div>

				<div className="flex items-center gap-2">
					{next && toMove.length > 0 && (
						<Button
							size="lg"
							disabled={bulk.isPending}
							onClick={() =>
								bulk.run({
									reservationId: reservation.id,
									units: toMove,
									direction: 'forward',
									title: `${RESERVATION_STATUS_META[next].label}: ${toMove.length} ${itemsWord(toMove.length)}`,
								})
							}
						>
							{NEXT_STEP_ACTION_LABELS[next]} vše
							<ArrowRightIcon data-icon="inline-end" />
						</Button>
					)}
					{(canEdit(reservation.status) || cancellable) && (
						<DropdownMenu>
							<DropdownMenuTrigger
								render={<Button variant="outline" size="icon-lg" aria-label="Další akce" />}
							>
								<EllipsisVerticalIcon />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{canEdit(reservation.status) && (
									<DropdownMenuItem
										render={
											<Link
												to="/reservation/$reservationId/edit"
												params={{ reservationId: reservation.id }}
											/>
										}
									>
										<PencilIcon />
										Upravit rezervaci
									</DropdownMenuItem>
								)}
								{/* only while nothing on it has been picked up */}
								{cancellable && (
									<DropdownMenuItem variant="destructive" onClick={() => setCancelOpen(true)}>
										<BanIcon />
										Zrušit rezervaci
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</section>

			{/*  Where the whole family is  */}
			<div className="mb-6">
				<ReservationStepper units={units} current={reservation.status} />
			</div>

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
						<ReservationPersonCard key={person.id} person={person} />
					))
				)}
			</div>
		</div>
	)
}
