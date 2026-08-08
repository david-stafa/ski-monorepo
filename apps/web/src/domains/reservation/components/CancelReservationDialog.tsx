import { Button } from '@ski-blazek/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ski-blazek/ui/components/dialog'
import { BanIcon, TriangleAlertIcon } from 'lucide-react'
import { formatDate } from '~/lib/format'
import { useCancelReservation } from '../reservationQueries'
import type { ReservationListItem } from '../reservation.types'

type CancelReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: ReservationListItem
}

export const CancelReservationDialog = ({
  open,
  onOpenChange,
  reservation,
}: CancelReservationDialogProps) => {
  const cancelReservation = useCancelReservation()

  const handleCancel = () => {
    cancelReservation.mutate({ id: reservation.id })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlertIcon className="text-destructive size-5" />
            Opravdu chcete zrušit tuto rezervaci?
          </DialogTitle>
          <DialogDescription>
            Zrušením se uvolní veškeré rezervované vybavení. Tato akce je
            nevratná.
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm">
          <p className="font-medium">{reservation.name}</p>
          <p className="text-muted-foreground">
            {formatDate(reservation.startDate)} –{' '}
            {formatDate(reservation.endDate)} · {reservation._count.people} osob
            · {reservation._count.reservationItems} kusů vybavení
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Zpět</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleCancel}>
            <BanIcon className="size-4" />
            Zrušit rezervaci
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
