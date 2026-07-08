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
import { CirclePlusIcon, TriangleAlertIcon } from 'lucide-react'

type ActivateDialogProps = React.PropsWithChildren & {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onActivate: () => void
}

export const ActivateDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onActivate,
  children,
}: ActivateDialogProps) => {
  const handleActivate = () => {
    onActivate()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlertIcon className="text-primary size-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Zrušit</Button>
          </DialogClose>
          <Button variant="default" onClick={handleActivate}>
            <CirclePlusIcon className="size-4" />
            Aktivovat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
