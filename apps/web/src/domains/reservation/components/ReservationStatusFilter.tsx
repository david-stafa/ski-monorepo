import type { ReservationStatus } from '@ski-blazek/db/browser'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@ski-blazek/ui/components/select'
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
	<Select
		items={ITEMS}
		value={status ?? ALL}
		onValueChange={(value) =>
			onStatusChange(value === ALL ? undefined : (value as ReservationStatus))
		}
	>
		<SelectTrigger className="w-45" size="sm">
			<SelectValue />
		</SelectTrigger>
		<SelectContent>
			{ITEMS.map((item) => (
				<SelectItem key={item.value} value={item.value}>
					{item.label}
				</SelectItem>
			))}
		</SelectContent>
	</Select>
)
