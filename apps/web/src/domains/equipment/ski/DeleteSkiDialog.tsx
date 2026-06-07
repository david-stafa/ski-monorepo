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
import { useDeleteSki } from './queries/skiQueries'

type DeleteSkiDialogProps = {
  id: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DeleteSkiDialog = ({
  id,
  open,
  onOpenChange,
}: DeleteSkiDialogProps) => {
  const deleteSki = useDeleteSki()

  const handleDelete = () => {
    deleteSki.mutate(id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opravdu chcete smazat tuto položku?</DialogTitle>
          <DialogDescription>
            Opravdu chcete smazat tuto lyži? Tato akce je nevratná.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Zrušit</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete}>
            Smazat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
