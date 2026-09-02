import { isChecked } from '@ski-blazek/api/schemas'
import type { EquipmentItemType } from '@ski-blazek/db/browser'
import { Checkbox } from '@ski-blazek/ui/components/checkbox'
import { useSetChecked } from '../queries/equipmentQueries'

type StockCheckCheckboxProps = {
	equipmentItemId: string
	lastCheckedAt: Date | null
	type: EquipmentItemType
}

/**
 * "I'm holding this one." Writes the date straight away — the state has to
 * survive a reload, and a stock check is walked with a tablet in one hand.
 * Unticking clears it again, which is the mistake-correction path.
 */
export const StockCheckCheckbox = ({
	equipmentItemId,
	lastCheckedAt,
	type,
}: StockCheckCheckboxProps) => {
	const setChecked = useSetChecked(type)

	return (
		<Checkbox
			checked={isChecked(lastCheckedAt)}
			disabled={setChecked.isPending}
			onCheckedChange={(checked) => setChecked.mutate({ id: equipmentItemId, checked })}
			aria-label="Zkontrolováno"
			className="h-5 w-5"
		/>
	)
}
