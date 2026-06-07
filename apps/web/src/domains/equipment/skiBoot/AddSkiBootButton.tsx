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
import { SkiBootForm } from './SkiBootForm'
import type { SkiBoot } from '@ski-blazek/db/browser'

type AddSkiBootButtonProps = {
  defaultValues?: Omit<SkiBoot, 'createdAt' | 'updatedAt'>
}

export const AddSkiBootButton = ({ defaultValues }: AddSkiBootButtonProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Přidat lyžařskou botu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Přidat lyžařskou botu</DialogTitle>
        </DialogHeader>
        <SkiBootForm
          close={() => setOpen(false)}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  )
}
