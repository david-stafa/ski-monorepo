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
import type { SnowboardListItem } from '../snowboard.types'
import { ActivateSnowboardDialog } from './ActivateSnowboardDialog'
import { DeleteSnowboardDialog } from './DeleteSnowboardDialog'
import { EditSnowboardDialog } from './EditSnowboardDialog'
import { RetireSnowboardDialog } from './RetireSnowboardDialog'

type SnowboardActionsProps = {
	defaultValues: SnowboardListItem
}

export const SnowboardActions = ({ defaultValues }: SnowboardActionsProps) => {
	const [editOpen, setEditOpen] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [retireOpen, setRetireOpen] = useState(false)
	const [activateOpen, setActivateOpen] = useState(false)

	const isRetired = Boolean(defaultValues.equipmentItem.retiredAt)

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button variant="default" size="icon-sm" />}>
					<EllipsisVerticalIcon />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{/* EDIT */}
					<DropdownMenuItem onClick={() => setEditOpen(true)}>
						<PencilIcon />
						Upravit
					</DropdownMenuItem>
					{/* ACTIVATE */}
					{isRetired && (
						<DropdownMenuItem
							className="text-primary focus:text-primary focus:**:text-primary!"
							onClick={() => setActivateOpen(true)}
						>
							<CirclePlusIcon />
							Aktivovat
						</DropdownMenuItem>
					)}
					{/* RETIRE */}
					{!isRetired && (
						<DropdownMenuItem
							className="text-warning focus:text-warning focus:**:text-warning!"
							onClick={() => setRetireOpen(true)}
						>
							<ArchiveIcon />
							Archivovat
						</DropdownMenuItem>
					)}
					{/* DELETE */}
					<DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
						<Trash2Icon />
						Smazat
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<EditSnowboardDialog
				open={editOpen}
				onOpenChange={setEditOpen}
				defaultValues={defaultValues}
			/>
			<DeleteSnowboardDialog
				defaultValues={defaultValues}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
			<RetireSnowboardDialog
				defaultValues={defaultValues}
				open={retireOpen}
				onOpenChange={setRetireOpen}
			/>
			<ActivateSnowboardDialog
				defaultValues={defaultValues}
				open={activateOpen}
				onOpenChange={setActivateOpen}
			/>
		</>
	)
}
