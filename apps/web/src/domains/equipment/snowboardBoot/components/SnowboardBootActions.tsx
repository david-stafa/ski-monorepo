import { Button } from '@ski-blazek/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import {
  ArchiveIcon,
  CirclePlusIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'
import type { SnowboardBootListItem } from '../snowboardBoot.types'
import { ActivateSnowboardBootDialog } from './ActivateSnowboardBootDialog'
import { DeleteSnowboardBootDialog } from './DeleteSnowboardBootDialog'
import { EditSnowboardBootDialog } from './EditSnowboardBootDialog'
import { RetireSnowboardBootDialog } from './RetireSnowboardBootDialog'

type SnowboardBootActionsProps = {
  defaultValues: SnowboardBootListItem
}

export const SnowboardBootActions = ({
  defaultValues,
}: SnowboardBootActionsProps) => {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [retireOpen, setRetireOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)

  const isRetired = Boolean(defaultValues.equipmentItem.retiredAt)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="icon-sm">
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* EDIT */}
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <PencilIcon />
            Upravit
          </DropdownMenuItem>
          {/* ACTIVATE */}
          {isRetired && (
            <DropdownMenuItem
              className={'text-primary focus:text-primary'}
              onSelect={() => setActivateOpen(true)}
            >
              <CirclePlusIcon className="text-primary" />
              Aktivovat
            </DropdownMenuItem>
          )}
          {/* RETIRE */}
          {!isRetired && (
            <DropdownMenuItem
              className={'text-warning focus:text-warning'}
              onSelect={() => setRetireOpen(true)}
            >
              <ArchiveIcon className="text-warning" />
              Archivovat
            </DropdownMenuItem>
          )}
          {/* DELETE */}
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
      <RetireSnowboardBootDialog
        defaultValues={defaultValues}
        open={retireOpen}
        onOpenChange={setRetireOpen}
      />
      <ActivateSnowboardBootDialog
        defaultValues={defaultValues}
        open={activateOpen}
        onOpenChange={setActivateOpen}
      />
    </>
  )
}
