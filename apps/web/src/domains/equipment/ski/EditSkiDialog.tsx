import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ski-blazek/ui/components/dialog'
import { SkiForm } from './SkiForm'
import type { Ski } from '@ski-blazek/db/browser'

type EditSkiDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Omit<Ski, 'createdAt' | 'updatedAt'>
}

export const EditSkiDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: EditSkiDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit lyže</DialogTitle>
        </DialogHeader>
        <SkiForm
          close={() => onOpenChange(false)}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  )
}
