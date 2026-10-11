import { Button } from '@ski-blazek/ui/components/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { Progress, ProgressLabel } from '@ski-blazek/ui/components/progress'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@ski-blazek/ui/components/sheet'
import { Skeleton } from '@ski-blazek/ui/components/skeleton'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import {
	ArrowRightIcon,
	CalendarIcon,
	CheckIcon,
	EllipsisVerticalIcon,
	ExternalLinkIcon,
	MessageCircleIcon,
	PhoneIcon,
	XIcon,
} from 'lucide-react'
import { formatPhone } from '~/lib/format'
import { trpc } from '~/lib/trpc'
import { NEXT_STEP_ACTION_LABELS, RESERVATION_STATUS_META } from '../helpers/reservationStatus'
import type { SheetStep } from '../helpers/sheetSteps'
import { getPersonUnits, itemsWord, statusRank } from '../helpers/stepUnits'
import { useBulkStep } from '../reservationQueries'
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
			showCloseButton={false}
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
	// done = reached this step's target or went past it (a returned item was also picked up)
	const doneCount = units.filter((unit) => statusRank(unit.status) >= statusRank(step.to)).length
	const action = NEXT_STEP_ACTION_LABELS[step.to]

	return (
		<>
			<SheetHeader className="border-b py-4 md:py-6">
				<div className="flex items-center gap-2">
					<SheetTitle className="text-lg">{reservation.name}</SheetTitle>
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
					{/* in the row instead of the sheet's own absolutely placed one, so it lines up */}
					<SheetClose
						render={
							<Button variant="ghost" size="icon-sm" className="bg-secondary" aria-label="Zavřít" />
						}
					>
						<XIcon />
					</SheetClose>
				</div>
				<SheetDescription className="flex flex-row gap-4 text-sm">
					<span className="flex items-center gap-1">
						<PhoneIcon size={14} />
						{formatPhone(reservation.phoneNumber)}
					</span>
					<span className="flex items-center gap-1">
						<CalendarIcon size={14} />
						{format(reservation.startDate, 'EEEEEE d. M.', { locale: cs })} –{' '}
						{format(reservation.endDate, 'EEEEEE d. M. yyyy', { locale: cs })}
					</span>
				</SheetDescription>
				{units.length > 0 && (
					<Progress value={(doneCount / units.length) * 100} className="mt-1">
						<ProgressLabel>
							{RESERVATION_STATUS_META[step.to].label} {doneCount} z {units.length}
						</ProgressLabel>
					</Progress>
				)}
			</SheetHeader>

			<div className="flex-1 space-y-4 overflow-y-auto p-4">
				{reservation.note && (
					<div className="flex w-full items-start gap-2 rounded-2xl bg-input/50 px-3 py-2 text-sm">
						<MessageCircleIcon size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
						<p>
							<span className="text-muted-foreground">Poznámka: </span>
							{reservation.note}
						</p>
					</div>
				)}
				{people.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						K této rezervaci nejsou přiřazeny žádné osoby.
					</p>
				) : (
					people.map((person) => <StepPersonBlock key={person.id} person={person} step={step} />)
				)}
			</div>

			<SheetFooter className="border-t py-4 md:py-6">
				{waiting.length > 0 && (
					<p className="text-center text-muted-foreground text-sm">
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
