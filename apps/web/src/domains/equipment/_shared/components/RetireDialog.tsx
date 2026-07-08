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
import { ArchiveIcon, TriangleAlertIcon } from 'lucide-react'

type RetireDialogProps = React.PropsWithChildren & {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onRetire: () => void
}

export const RetireDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onRetire,
  children,
}: RetireDialogProps) => {
  const handleRetire = () => {
    onRetire()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlertIcon className="text-warning size-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Zrušit</Button>
          </DialogClose>
          <Button variant="warning" onClick={handleRetire}>
            <ArchiveIcon className="size-4" />
            Archivovat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
