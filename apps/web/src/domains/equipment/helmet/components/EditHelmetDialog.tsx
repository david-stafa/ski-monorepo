import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ski-blazek/ui/components/dialog'
import { HelmetForm } from './HelmetForm'
import type { HelmetListItem } from '../helmet.types'

type EditHelmetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: HelmetListItem
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
