import { useState } from 'react'
import { Button } from '@ski-blazek/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ski-blazek/ui/components/dialog'
import { PlusIcon } from 'lucide-react'
import { SnowboardForm } from './SnowboardForm'
import type { Snowboard } from '@ski-blazek/db/browser'

type AddSnowboardButtonProps = {
  defaultValues?: Omit<Snowboard, 'createdAt' | 'updatedAt'>
}

export const AddSnowboardButton = ({
  defaultValues,
}: AddSnowboardButtonProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Přidat snowboard
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Přidat snowboard</DialogTitle>
        </DialogHeader>
        <SnowboardForm
          close={() => setOpen(false)}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  )
}
