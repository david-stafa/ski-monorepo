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
import { SnowboardForm } from './SnowboardForm'

export const AddSnowboardButton = () => {
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
        <SnowboardForm close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
