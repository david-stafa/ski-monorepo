import { Button } from '@ski-blazek/ui/components/button'
import { ClipboardCheckIcon, XIcon } from 'lucide-react'

type InventoryToggleButtonProps = {
	inventory: boolean
	onToggle: (inventory: boolean) => void
}

/**
 * Enters / leaves the stock check. Inventory mode is a URL flag rather than a
 * separate page, so the everyday table stays untouched for the other 364 days
 * of the year and a half-finished check survives a reload.
 */
export const InventoryToggleButton = ({ inventory, onToggle }: InventoryToggleButtonProps) => (
	<Button
		variant={inventory ? 'default' : 'outline'}
		size="sm"
		onClick={() => onToggle(!inventory)}
	>
		{inventory ? <XIcon className="size-4" /> : <ClipboardCheckIcon className="size-4" />}
		{inventory ? 'Ukončit inventuru' : 'Inventura'}
	</Button>
)
