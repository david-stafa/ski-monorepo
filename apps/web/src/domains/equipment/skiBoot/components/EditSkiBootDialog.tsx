import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ski-blazek/ui/components/dialog'
import type { SkiBootListItem } from '../skiBoot.types'
import { SkiBootForm } from './SkiBootForm'

type EditSkiBootDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: SkiBootListItem
}

export const EditSkiBootDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: EditSkiBootDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit lyžařskou botu</DialogTitle>
        </DialogHeader>
        <SkiBootForm
          close={() => onOpenChange(false)}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  )
}
