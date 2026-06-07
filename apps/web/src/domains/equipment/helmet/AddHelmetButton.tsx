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
import { HelmetForm } from './HelmetForm'
import type { Helmet } from '@ski-blazek/db/browser'

type AddHelmetButtonProps = {
  defaultValues?: Omit<Helmet, 'createdAt' | 'updatedAt'>
}

export const AddHelmetButton = ({ defaultValues }: AddHelmetButtonProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Přidat helmu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Přidat helmu</DialogTitle>
        </DialogHeader>
        <HelmetForm close={() => setOpen(false)} defaultValues={defaultValues} />
      </DialogContent>
    </Dialog>
  )
}
