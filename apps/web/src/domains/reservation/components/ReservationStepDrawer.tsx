import { Button } from '@ski-blazek/ui/components/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@ski-blazek/ui/components/sheet'
import { Skeleton } from '@ski-blazek/ui/components/skeleton'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, CheckIcon, EllipsisVerticalIcon, ExternalLinkIcon } from 'lucide-react'
import { formatDate } from '~/lib/format'
import { trpc } from '~/lib/trpc'
import { NEXT_STEP_ACTION_LABELS, RESERVATION_STATUS_META } from '../helpers/reservationStatus'
import type { SheetStep } from '../helpers/sheetSteps'
import { getPersonUnits, itemsWord, statusRank } from '../helpers/stepUnits'
import { useBulkStep } from '../reservationQueries'
import { FlagBadges } from './FlagBadges'
import { StepPersonBlock } from './StepPersonBlock'

type ReservationStepDrawerProps = {
	/** The reservation to show, or null while the drawer is closed. */
	reservationId: string | null
	step: SheetStep
	onClose: () => void
}

/**
 * The counter's working surface: one reservation, everything on it as a
 * checklist for this sheet's step, and a sticky button that does the rest.
 * Opened from a row on Příprava, Výdej or Vrácení.
 */
export const ReservationStepDrawer = ({
	reservationId,
	step,
	onClose,
}: ReservationStepDrawerProps) => (
	<Sheet open={reservationId !== null} onOpenChange={(open) => !open && onClose()}>
		{/* full width on a phone, a side panel from tablet up */}
		<SheetContent
			side="right"
			className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
		>
			{reservationId && <DrawerBody reservationId={reservationId} step={step} />}
		</SheetContent>
	</Sheet>
)

const DrawerBody = ({ reservationId, step }: { reservationId: string; step: SheetStep }) => {
	const bulk = useBulkStep()
	const { data: reservation } = useQuery(trpc.reservation.get.queryOptions({ id: reservationId }))

	if (!reservation) {
		return (
			<div className="space-y-3 p-4">
				<Skeleton className="h-8 w-1/2" />
				<Skeleton className="h-40 w-full" />
			</div>
		)
	}

	// Cancelled people stay on the record but have nothing to hand over.
	const people = reservation.people.filter((person) => person.status !== 'CANCELLED')
	const units = people.flatMap(getPersonUnits)
	const remaining = units.filter((unit) => unit.status === step.from)
	const waiting = units.filter((unit) => statusRank(unit.status) < statusRank(step.from))
	const anyDone = units.some((unit) => unit.status === step.to)
	const action = NEXT_STEP_ACTION_LABELS[step.to]

	return (
		<>
			<SheetHeader className="border-b pr-12">
				<div className="flex items-center gap-2">
					<SheetTitle className="text-lg">{reservation.name}</SheetTitle>
					<FlagBadges flags={reservation} />
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									variant="ghost"
									size="icon-sm"
									className="ml-auto"
									aria-label="Další akce"
								/>
							}
						>
							<EllipsisVerticalIcon />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								render={
									<Link
										to="/reservation/$reservationId"
										params={{ reservationId: reservation.id }}
									/>
								}
							>
								<ExternalLinkIcon />
								Otevřít detail
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<SheetDescription>
					{reservation.phoneNumber} · {formatDate(reservation.startDate)} –{' '}
					{formatDate(reservation.endDate)}
				</SheetDescription>
			</SheetHeader>

			<div className="flex-1 space-y-3 overflow-y-auto p-4">
				<p className="text-muted-foreground text-sm">{step.hint}</p>
				{reservation.note && (
					<p className="text-sm">
						<span className="text-muted-foreground">Poznámka: </span>
						{reservation.note}
					</p>
				)}
				{people.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						K této rezervaci nejsou přiřazeny žádné osoby.
					</p>
				) : (
					people.map((person) => <StepPersonBlock key={person.id} person={person} step={step} />)
				)}
			</div>

			<SheetFooter className="border-t">
				{waiting.length > 0 && (
					<p className="text-muted-foreground text-center text-sm">
						Na předchozí krok čeká: {waiting.length} {itemsWord(waiting.length)}
					</p>
				)}
				{remaining.length > 0 ? (
					<Button
						size="lg"
						className="h-12 w-full text-base"
						disabled={bulk.isPending}
						onClick={() =>
							bulk.run({
								reservationId: reservation.id,
								units: remaining,
								direction: 'forward',
								title: `${RESERVATION_STATUS_META[step.to].label}: ${remaining.length} ${itemsWord(remaining.length)}`,
							})
						}
					>
						{action} {anyDone ? 'zbývající' : 'vše'} ({remaining.length})
						<ArrowRightIcon data-icon="inline-end" />
					</Button>
				) : (
					<Button size="lg" variant="outline" className="h-12 w-full text-base" disabled>
						<CheckIcon data-icon="inline-start" />
						Hotovo
					</Button>
				)}
			</SheetFooter>
		</>
	)
}
