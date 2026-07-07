import { Button } from '@ski-blazek/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ski-blazek/ui/components/dialog'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { SkiBootForm } from './SkiBootForm'

export const AddSkiBootButton = () => {
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
        <SkiBootForm close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
