import type { ReservationStatus } from '@ski-blazek/db/browser'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ski-blazek/ui/components/select'
import {
  RESERVATION_STATUS_META,
  RESERVATION_STATUS_OPTIONS,
} from '../helpers/reservationStatus'

/** Radix rejects an empty string as an item value, so "no filter" needs a sentinel. */
const ALL = 'ALL'

type ReservationStatusFilterProps = {
  status?: ReservationStatus
  onStatusChange: (status: ReservationStatus | undefined) => void
}

export const ReservationStatusFilter = ({
  status,
  onStatusChange,
}: ReservationStatusFilterProps) => (
  <Select
    value={status ?? ALL}
    onValueChange={(value) =>
      onStatusChange(value === ALL ? undefined : (value as ReservationStatus))
    }
  >
    <SelectTrigger className="w-45" size="sm">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value={ALL}>Všechny stavy</SelectItem>
      {RESERVATION_STATUS_OPTIONS.map((option) => (
        <SelectItem key={option} value={option}>
          {RESERVATION_STATUS_META[option].label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)
