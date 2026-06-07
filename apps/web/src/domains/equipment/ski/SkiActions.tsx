import { Button } from '@ski-blazek/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { DeleteSkiDialog } from './DeleteSkiDialog'
import { EditSkiDialog } from './EditSkiDialog'
import type { Ski } from '@ski-blazek/db/browser'

type SkiActionsProps = {
  defaultValues: Omit<Ski, 'createdAt' | 'updatedAt'>
}

export const SkiActions = ({ defaultValues }: SkiActionsProps) => {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="icon-sm">
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <PencilIcon />
            Upravit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2Icon className='text-destructive'/>
            Smazat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditSkiDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        defaultValues={defaultValues}
      />
      <DeleteSkiDialog
        id={defaultValues.id}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
