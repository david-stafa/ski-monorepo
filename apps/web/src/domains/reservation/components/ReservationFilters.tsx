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
import { RESERVATION_STATUS_OPTIONS } from '../helpers/reservationStatus'

/** Base UI rejects an empty string as an item value, so "no filter" needs a sentinel. */
const ALL = 'ALL'

const STATUS_ITEMS = [{ value: ALL, label: 'Všechny stavy' }, ...RESERVATION_STATUS_OPTIONS]

const KIND_ITEMS: { value: ReservationKindFilter; label: string }[] = [
	{ value: 'all', label: 'Všechny typy' },
	{ value: 'seasonal', label: 'Sezónní' },
	{ value: 'regular', label: 'Běžná' },
]

type ReservationFiltersProps = {
	kind: ReservationKindFilter
	onKindChange: (kind: ReservationKindFilter) => void
	/** Leave both status props out on a page whose status is fixed (prep). */
	status?: ReservationStatus
	onStatusChange?: (status: ReservationStatus | undefined) => void
}

export const ReservationFilters = ({
	kind,
	onKindChange,
	status,
	onStatusChange,
}: ReservationFiltersProps) => (
	<Popover>
		<PopoverTrigger render={<Button variant="default" />}>
			<ListFilterIcon />
			Filtry
		</PopoverTrigger>
		<PopoverContent align="start" className="flex flex-col gap-3 p-3">
			{onStatusChange && (
				<div className="flex justify-between gap-4">
					<Label htmlFor="status">Status</Label>
					<Select
						id="status"
						items={STATUS_ITEMS}
						value={status ?? ALL}
						onValueChange={(value) =>
							onStatusChange(value === ALL ? undefined : (value as ReservationStatus))
						}
					>
						<SelectTrigger className="w-45 m-0" size="sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{STATUS_ITEMS.map((item) => (
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
		</PopoverContent>
	</Popover>
)
