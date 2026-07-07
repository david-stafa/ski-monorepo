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
import { Trash2Icon, TriangleAlertIcon } from 'lucide-react'

type DeleteDialogProps = React.PropsWithChildren & {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onDelete: () => void
}

export const DeleteDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onDelete,
  children,
}: DeleteDialogProps) => {
  const handleDelete = () => {
    onDelete()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlertIcon className="text-destructive size-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Zrušit</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2Icon className="size-4" />
            Smazat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
