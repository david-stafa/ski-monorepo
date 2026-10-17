import type { EquipmentItemType } from '@ski-blazek/db/browser'
import { Button } from '@ski-blazek/ui/components/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { ArchiveIcon, ClipboardCheckIcon, EllipsisVerticalIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { StockSweepDialog } from './StockSweepDialog'

type EquipmentDropdownProps = {
	isInventory: boolean
	onInventoryToggle: (inventory: boolean) => void
	type: EquipmentItemType
}

/** The header's less frequent actions: entering / leaving the stock check, and
 * closing it by archiving whatever wasn't checked. */
export const EquipmentDropdown = ({
	isInventory,
	onInventoryToggle,
	type,
}: EquipmentDropdownProps) => {
	const [sweepOpen, setSweepOpen] = useState(false)

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={<Button variant="outline" size="icon-lg" aria-label="Další akce" />}
				>
					<EllipsisVerticalIcon />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-auto">
					<DropdownMenuGroup>
						<DropdownMenuLabel>Inventura</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => onInventoryToggle(!isInventory)}>
							{isInventory ? <XIcon /> : <ClipboardCheckIcon />}
							{isInventory ? 'Ukončit inventuru' : 'Zahájit inventuru'}
						</DropdownMenuItem>
						{isInventory && (
							<DropdownMenuItem variant="destructive" onClick={() => setSweepOpen(true)}>
								<ArchiveIcon />
								Archivovat nezkontrolované
							</DropdownMenuItem>
						)}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			{/*  Outside the menu, so closing the menu doesn't unmount the dialog  */}
			<StockSweepDialog open={sweepOpen} onOpenChange={setSweepOpen} type={type} />
		</>
	)
}
