import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ski-blazek/ui/components/dialog'
import { SkiBootForm } from './SkiBootForm'
import type { SkiBoot } from '@ski-blazek/db/browser'

type EditSkiBootDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Omit<SkiBoot, 'createdAt' | 'updatedAt'>
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
