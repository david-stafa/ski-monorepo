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

const ITEMS = [{ value: ALL, label: 'Všechny stavy' }, ...RESERVATION_STATUS_OPTIONS]

type ReservationStatusFilterProps = {
	status?: ReservationStatus
	onStatusChange: (status: ReservationStatus | undefined) => void
}

export const ReservationStatusFilter = ({
	status,
	onStatusChange,
}: ReservationStatusFilterProps) => (
	<Popover>
		<PopoverTrigger render={<Button variant="default" />}>
			<ListFilterIcon />
			Filtry
		</PopoverTrigger>
		<PopoverContent align="start" className="p-3">
			<div className="flex justify-between gap-4">
				<Label htmlFor="status">Status</Label>
				<Select
					id="status"
					items={ITEMS}
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
							{ITEMS.map((item) => (
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
