import type { SnowboardBoot } from '@ski-blazek/db/browser'
import { Button } from '@ski-blazek/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { DeleteSnowboardBootDialog } from './DeleteSnowboardBootDialog'
import { EditSnowboardBootDialog } from './EditSnowboardBootDialog'

type SnowboardBootActionsProps = {
  defaultValues: Omit<SnowboardBoot, 'createdAt' | 'updatedAt'>
}

export const SnowboardBootActions = ({
  defaultValues,
}: SnowboardBootActionsProps) => {
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
            <Trash2Icon className="text-destructive" />
            Smazat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditSnowboardBootDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        defaultValues={defaultValues}
      />
      <DeleteSnowboardBootDialog
        defaultValues={defaultValues}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
