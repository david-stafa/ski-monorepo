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
import { SkiForm } from './SkiForm'
import type { Ski } from '@ski-blazek/db/browser'

type AddSkiButtonProps = {
  defaultValues?: Omit<Ski, 'createdAt' | 'updatedAt'>
}

export const AddSkiButton = ({ defaultValues }: AddSkiButtonProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Přidat lyže
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Přidat lyže</DialogTitle>
        </DialogHeader>
        <SkiForm close={() => setOpen(false)} defaultValues={defaultValues} />
      </DialogContent>
    </Dialog>
  )
}
