import { ReservationStatus } from '@ski-blazek/db/browser'
import { Button } from '@ski-blazek/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { BanIcon, EllipsisVerticalIcon } from 'lucide-react'
import { useState } from 'react'
import type { ReservationListItem } from '../reservation.types'
import { CancelReservationDialog } from './CancelReservationDialog'

type ReservationActionsProps = {
  reservation: ReservationListItem
}

export const ReservationActions = ({
  reservation,
}: ReservationActionsProps) => {
  const [cancelOpen, setCancelOpen] = useState(false)

  const isCancelled = reservation.status === ReservationStatus.CANCELLED

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="icon-sm">
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* CANCEL */}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={isCancelled}
            onSelect={() => setCancelOpen(true)}
          >
            <BanIcon className="text-destructive" />
            Zrušit rezervaci
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CancelReservationDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        reservation={reservation}
      />
    </>
  )
}
