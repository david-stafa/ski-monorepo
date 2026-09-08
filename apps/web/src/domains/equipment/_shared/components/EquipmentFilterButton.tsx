import type { ArchivedFilter } from '@ski-blazek/api/schemas'
import { Button } from '@ski-blazek/ui/components/button'
import { Label } from '@ski-blazek/ui/components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@ski-blazek/ui/components/popover'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@ski-blazek/ui/components/select'
import { ListFilterIcon } from 'lucide-react'

const ITEMS: { value: ArchivedFilter; label: string }[] = [
	{ value: 'active', label: 'Pouze aktivní' },
	{ value: 'archived', label: 'Pouze archivované' },
	{ value: 'all', label: 'Aktivní i archivované' },
]

type EquipmentFilterButtonProps = {
	archivedFilter: ArchivedFilter
	onArchivedFilterChange: (archivedFilter: ArchivedFilter) => void
}

/**
 * Table filters that aren't part of the everyday flow. Archived stock is hidden
 * by default — it stays in the database for its history, not to be scrolled
 * past — so this is how you go and look at it.
 */
export const EquipmentFilterButton = ({
	archivedFilter,
	onArchivedFilterChange,
}: EquipmentFilterButtonProps) => (
	<Popover>
		<PopoverTrigger render={<Button variant="default" size="sm" />}>
			<ListFilterIcon className="size-4" />
			Filtry
		</PopoverTrigger>
		<PopoverContent align="start" className="p-3">
			<div className="flex items-center justify-between gap-4">
				<Label htmlFor="archivedFilter">Archiv</Label>
				<Select
					id="archivedFilter"
					items={ITEMS}
					value={archivedFilter}
					// Base UI widens the value to `string | null`; this Select is never cleared.
					onValueChange={(value) => {
						if (value !== null) onArchivedFilterChange(value as ArchivedFilter)
					}}
				>
					<SelectTrigger className="w-50" size="sm">
						{/*  Base UI renders the raw value unless told how to label it.  */}
						<SelectValue>{(current) => ITEMS.find((i) => i.value === current)?.label}</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{ITEMS.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</PopoverContent>
	</Popover>
)
