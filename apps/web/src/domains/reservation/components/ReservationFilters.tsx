import type { ReservationKindFilter } from '@ski-blazek/api/schemas'
import type { ReservationStatus } from '@ski-blazek/db/browser'
import { Button } from '@ski-blazek/ui/components/button'
import { Label } from '@ski-blazek/ui/components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@ski-blazek/ui/components/popover'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@ski-blazek/ui/components/select'
import { ListFilterIcon } from 'lucide-react'
import { DateFilter } from '~/components/ui/DateFilter'
import { RESERVATION_STATUS_META, RESERVATION_STATUS_OPTIONS } from '../helpers/reservationStatus'

const KIND_ITEMS: { value: ReservationKindFilter; label: string }[] = [
	{ value: 'all', label: 'Všechny typy' },
	{ value: 'seasonal', label: 'Sezónní' },
	{ value: 'regular', label: 'Běžná' },
]

type ReservationFiltersProps = {
	kind: ReservationKindFilter
	onKindChange: (kind: ReservationKindFilter) => void
	/** Leave both status props out on a page whose status is fixed (prep).
	 * An empty list means no status filter. */
	statuses?: ReservationStatus[]
	onStatusesChange?: (statuses: ReservationStatus[]) => void
	/** Leave the date props out on a page with its own date window (the
	 * counter pages). Undefined means that end is open. */
	from?: string
	to?: string
	onFromChange?: (from: string | undefined) => void
	onToChange?: (to: string | undefined) => void
}

/** The ticked statuses in dropdown order rather than click order, so the same
 * choice always gives the same URL (and the reset button sees it as default). */
const inDropdownOrder = (statuses: ReservationStatus[]) =>
	RESERVATION_STATUS_OPTIONS.map((option) => option.value).filter((status) =>
		statuses.includes(status)
	)

export const ReservationFilters = ({
	kind,
	onKindChange,
	statuses,
	onStatusesChange,
	from,
	to,
	onFromChange,
	onToChange,
}: ReservationFiltersProps) => (
	<Popover>
		<PopoverTrigger render={<Button variant="default" />}>
			<ListFilterIcon />
			Filtry
		</PopoverTrigger>
		<PopoverContent align="start" className="flex flex-col gap-3 p-3">
			{onStatusesChange && (
				<div className="flex justify-between gap-4">
					<Label htmlFor="status">Status</Label>
					<Select
						id="status"
						multiple
						items={RESERVATION_STATUS_OPTIONS}
						value={statuses ?? []}
						onValueChange={(value) => onStatusesChange(inDropdownOrder(value))}
					>
						<SelectTrigger className="w-45 m-0" size="sm">
							<SelectValue>
								{(value: ReservationStatus[]) =>
									value.length === 0
										? 'Všechny stavy'
										: value.map((status) => RESERVATION_STATUS_META[status].label).join(', ')
								}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{RESERVATION_STATUS_OPTIONS.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			)}

			<div className="flex justify-between gap-4">
				<Label htmlFor="kind">Typ</Label>
				<Select
					id="kind"
					items={KIND_ITEMS}
					value={kind}
					onValueChange={(value) => onKindChange(value as ReservationKindFilter)}
				>
					<SelectTrigger className="w-45 m-0" size="sm">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{KIND_ITEMS.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			{onFromChange && (
				<div className="flex items-center justify-between gap-4">
					<Label htmlFor="from">Od</Label>
					<DateFilter id="from" className="w-45" value={from} onValueChange={onFromChange} />
				</div>
			)}

			{onToChange && (
				<div className="flex items-center justify-between gap-4">
					<Label htmlFor="to">Do</Label>
					<DateFilter id="to" className="w-45" value={to} onValueChange={onToChange} />
				</div>
			)}
		</PopoverContent>
	</Popover>
)
