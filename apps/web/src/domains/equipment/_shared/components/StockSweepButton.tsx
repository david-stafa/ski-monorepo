import type { EquipmentItemType } from '@ski-blazek/db/browser'
import { Button } from '@ski-blazek/ui/components/button'
import { ArchiveIcon } from 'lucide-react'
import { useState } from 'react'
import { StockSweepDialog } from './StockSweepDialog'

type StockSweepButtonProps = {
	type: EquipmentItemType
}

/** Closes the stock check. The dialog behind it previews before anything moves. */
export const StockSweepButton = ({ type }: StockSweepButtonProps) => {
	const [open, setOpen] = useState(false)

	return (
		<>
			<Button variant="warning" size="sm" onClick={() => setOpen(true)}>
				<ArchiveIcon className="size-4" />
				Archivovat nezkontrolované
			</Button>

			<StockSweepDialog open={open} onOpenChange={setOpen} type={type} />
		</>
	)
}
