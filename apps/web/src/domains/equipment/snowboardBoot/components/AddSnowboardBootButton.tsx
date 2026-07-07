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
import { SnowboardBootForm } from './SnowboardBootForm'

export const AddSnowboardBootButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Přidat snowboardovou botu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Přidat snowboardovou botu</DialogTitle>
        </DialogHeader>
        <SnowboardBootForm close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
