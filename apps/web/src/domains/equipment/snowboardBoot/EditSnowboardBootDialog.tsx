import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ski-blazek/ui/components/dialog'
import { SnowboardBootForm } from './SnowboardBootForm'
import type { SnowboardBoot } from '@ski-blazek/db/browser'

type EditSnowboardBootDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Omit<SnowboardBoot, 'createdAt' | 'updatedAt'>
}

export const EditSnowboardBootDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: EditSnowboardBootDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit snowboardovou botu</DialogTitle>
        </DialogHeader>
        <SnowboardBootForm
          close={() => onOpenChange(false)}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  )
}
