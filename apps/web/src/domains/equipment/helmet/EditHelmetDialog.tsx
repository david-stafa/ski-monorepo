import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ski-blazek/ui/components/dialog'
import { HelmetForm } from './HelmetForm'
import type { Helmet } from '@ski-blazek/db/browser'

type EditHelmetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Omit<Helmet, 'createdAt' | 'updatedAt'>
}

export const EditHelmetDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: EditHelmetDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit helmu</DialogTitle>
        </DialogHeader>
        <HelmetForm
          close={() => onOpenChange(false)}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  )
}
