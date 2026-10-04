import { Badge } from '@ski-blazek/ui/components/badge'
import { Button } from '@ski-blazek/ui/components/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@ski-blazek/ui/components/table'
import { TypographyH1 } from '@ski-blazek/ui/components/typography'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { ReservationStatusBadge } from '~/domains/reservation/components/ReservationStatusBadge'
import { getEquipmentItemLabel } from '~/domains/reservation/helpers/getEquipmentItemLabel'
import { formatDate } from '~/lib/format'
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
	const router = useRouter()
	const canGoBack = useCanGoBack()
	const navigate = useNavigate()

	const {
		data: { equipmentItem, reservations },
	} = useSuspenseQuery(
		trpc.equipment.equipmentItem.findReservations.queryOptions({ id: equipmentId })
	)

	// Back to the list it was opened from, filters and all. From a pasted link
	// there is nothing to go back to, so fall back to the equipment overview.
	const goBack = () => {
		if (canGoBack) router.history.back()
		else navigate({ to: '/equipment' })
	}

	return (
		<div>
			<Button variant="ghost" size="sm" className="mb-4" onClick={goBack}>
				<ArrowLeftIcon data-icon="inline-start" />
				Zpět
			</Button>

			<div className="mb-6 flex flex-wrap items-center gap-2">
				<TypographyH1>{getEquipmentItemLabel(equipmentItem)}</TypographyH1>
				{equipmentItem.retiredAt && <Badge variant="outline">Vyřazeno</Badge>}
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Jméno</TableHead>
						<TableHead>Stav</TableHead>
						<TableHead>Od</TableHead>
						<TableHead>Do</TableHead>
						<TableHead>Telefon</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{reservations.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} className="h-50 text-center">
								Toto vybavení zatím nebylo rezervováno.
							</TableCell>
						</TableRow>
					) : (
						reservations.map((item) => (
							<TableRow
								key={item.id}
								className="cursor-pointer"
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
								<TableCell>{formatDate(item.startDate)}</TableCell>
								<TableCell>{formatDate(item.endDate)}</TableCell>
								<TableCell>{item.reservation.phoneNumber}</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	)
}
