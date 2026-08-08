import type { ReservationStatus } from '@ski-blazek/db/browser'
import { Badge } from '@ski-blazek/ui/components/badge'
import { RESERVATION_STATUS_META } from '../helpers/reservationStatus'

type ReservationStatusBadgeProps = {
  status: ReservationStatus
}

export const ReservationStatusBadge = ({
  status,
}: ReservationStatusBadgeProps) => {
  const { label, variant } = RESERVATION_STATUS_META[status]

  return <Badge variant={variant}>{label}</Badge>
}
