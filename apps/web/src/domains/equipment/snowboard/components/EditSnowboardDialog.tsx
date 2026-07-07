import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ski-blazek/ui/components/dialog'
import { SnowboardForm } from './SnowboardForm'
import type { SnowboardListItem } from '../snowboard.types'

type EditSnowboardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: SnowboardListItem
}

export const EditSnowboardDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: EditSnowboardDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit snowboard</DialogTitle>
        </DialogHeader>
        <SnowboardForm
          close={() => onOpenChange(false)}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  )
}
