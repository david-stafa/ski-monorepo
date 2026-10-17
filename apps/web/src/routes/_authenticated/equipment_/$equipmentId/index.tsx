import { isChecked } from '@ski-blazek/api/schemas'
import { Badge } from '@ski-blazek/ui/components/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@ski-blazek/ui/components/table'
import { TypographyH1 } from '@ski-blazek/ui/components/typography'
import { cn } from '@ski-blazek/ui/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { startOfDay } from 'date-fns'
import { ArticleNumberBadge } from '~/domains/equipment/_shared/components/badges/ArticleNumberBadge'
import { EquipmentItemBadges } from '~/domains/equipment/_shared/components/badges/EquipmentBadges'
import { EQUIPMENT_TYPE_LABELS } from '~/domains/equipment/_shared/helpers/equipmentLabels'
import { ReservationStatusBadge } from '~/domains/reservation/components/ReservationStatusBadge'
import { formatDate, formatPhone, formatWeekdayRange } from '~/lib/format'
import { trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/equipment_/$equipmentId/')({
	loader: async ({ context, params }) =>
		context.queryClient.ensureQueryData(
			context.trpc.equipment.equipmentItem.findReservations.queryOptions({
				id: params.equipmentId,
			})
		),
	component: RouteComponent,
})

function RouteComponent() {
	const { equipmentId } = Route.useParams()
	const navigate = useNavigate()

	const {
		data: { equipmentItem, reservations },
	} = useSuspenseQuery(
		trpc.equipment.equipmentItem.findReservations.queryOptions({ id: equipmentId })
	)

	// Exactly one detail row is filled, whatever the type — see `types.ts`.
	const detail =
		equipmentItem.ski ??
		equipmentItem.snowboard ??
		equipmentItem.skiBoot ??
		equipmentItem.snowboardBoot ??
		equipmentItem.helmet

	// Bookings come newest first, so the last one not yet over is the next one.
	const today = startOfDay(new Date())
	const upcoming = reservations.filter((item) => item.endDate >= today)
	const nextReservation = upcoming.at(-1)

	// Back to the list it was opened from, filters and all. From a pasted link
	// there is nothing to go back to, so fall back to the equipment overview.

	return (
		<div>
			{/*  Type, sticker number and name, then what it is in badges  */}
			<section className="mb-6">
				<div className="mb-2 flex flex-wrap items-center gap-2">
					<span className="text-muted-foreground text-sm">
						{EQUIPMENT_TYPE_LABELS[equipmentItem.type]}
					</span>
					{equipmentItem.retiredAt && (
						<Badge variant="outline">Vyřazeno {formatDate(equipmentItem.retiredAt)}</Badge>
					)}
				</div>

				<div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
					<ArticleNumberBadge
						articleGroup={equipmentItem.articleGroup}
						articleNumber={equipmentItem.articleNumber}
						className="px-3 text-2xl tabular-nums"
					/>
					<TypographyH1 className={cn(equipmentItem.retiredAt && 'text-muted-foreground')}>
						{detail?.brand}
						{detail?.model && (
							<span className="ml-3 font-semibold text-muted-foreground">{detail.model}</span>
						)}
					</TypographyH1>
				</div>

				<EquipmentItemBadges item={equipmentItem} />
			</section>

			{/*  The three things asked at the counter: how busy, when next, seen this season  */}
			<dl className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
				<Fact label="Rezervací celkem" value={reservations.length} />
				<Fact
					label="Nejbližší rezervace"
					value={nextReservation ? nextReservation.reservation.name : 'Žádná'}
					hint={
						nextReservation &&
						formatWeekdayRange(nextReservation.startDate, nextReservation.endDate)
					}
				/>
				<Fact
					label="Inventura"
					value={isChecked(equipmentItem.lastCheckedAt) ? 'Zkontrolováno' : 'Nezkontrolováno'}
					hint={
						equipmentItem.lastCheckedAt
							? `Naposledy ${formatDate(equipmentItem.lastCheckedAt)}`
							: 'Ještě nikdy'
					}
				/>
			</dl>

			<h2 className="mb-3 font-semibold text-xl tracking-tight">Historie rezervací</h2>
			<div className="overflow-hidden rounded-xl border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Jméno</TableHead>
							<TableHead>Stav</TableHead>
							<TableHead>Termín</TableHead>
							<TableHead>Telefon</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{reservations.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
									Toto vybavení zatím nebylo rezervováno.
								</TableCell>
							</TableRow>
						) : (
							reservations.map((item) => (
								<TableRow
									key={item.id}
									// Past bookings stay listed but step back behind the coming ones.
									className={cn('cursor-pointer', item.endDate < today && 'text-muted-foreground')}
									onClick={() =>
										navigate({
											to: '/reservation/$reservationId',
											params: { reservationId: item.reservation.id },
										})
									}
								>
									<TableCell className="font-medium">{item.reservation.name}</TableCell>
									<TableCell>
										<ReservationStatusBadge status={item.status} />
									</TableCell>
									<TableCell>{formatWeekdayRange(item.startDate, item.endDate)}</TableCell>
									<TableCell className="tabular-nums">
										{formatPhone(item.reservation.phoneNumber)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

type FactProps = {
	label: string
	value: React.ReactNode
	hint?: React.ReactNode
}

const Fact = ({ label, value, hint }: FactProps) => (
	<div className="rounded-xl border px-4 py-3">
		<dt className="text-muted-foreground text-xs">{label}</dt>
		<dd className="mt-1 truncate font-semibold text-lg">{value}</dd>
		{hint && <dd className="truncate text-muted-foreground text-sm">{hint}</dd>}
	</div>
)
