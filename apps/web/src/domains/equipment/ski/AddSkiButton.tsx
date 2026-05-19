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

export const AddSkiButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <PlusIcon />
          Přidat lyže
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Přidat lyže</DialogTitle>
        </DialogHeader>
        <SkiForm close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
