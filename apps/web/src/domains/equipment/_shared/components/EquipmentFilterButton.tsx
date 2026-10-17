import type { ArchivedFilter, CheckedFilter } from '@ski-blazek/api/schemas'
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
import { useIsMobile } from '@ski-blazek/ui/hooks/use-mobile'
import { ListFilterIcon } from 'lucide-react'

const ARCHIVED: { value: ArchivedFilter; label: string }[] = [
	{ value: 'active', label: 'Pouze aktivní' },
	{ value: 'archived', label: 'Pouze archivované' },
	{ value: 'all', label: 'Všechny' },
]

const INVENTURA: { value: CheckedFilter; label: string }[] = [
	{ value: 'checked', label: 'Pouze označené' },
	{ value: 'unchecked', label: 'Pouze neoznačené' },
	{ value: 'all', label: 'Všechny' },
]

type EquipmentFilterButtonProps = {
	archivedFilter: ArchivedFilter
	onArchivedFilterChange: (archivedFilter: ArchivedFilter) => void
	inventuraFilter: CheckedFilter
	onInventuraFilterChange: (checkedFilter: CheckedFilter) => void
	isInventura: boolean
}

/**
 * Table filters that aren't part of the everyday flow. Archived stock is hidden
 * by default — it stays in the database for its history, not to be scrolled
 * past — so this is how you go and look at it.
 */
export const EquipmentFilterButton = ({
	archivedFilter,
	onArchivedFilterChange,
	inventuraFilter,
	onInventuraFilterChange,
	isInventura,
}: EquipmentFilterButtonProps) => {
	const isMobile = useIsMobile()
	return (
		<Popover>
			<PopoverTrigger render={<Button size={isMobile ? 'icon-lg' : 'lg'} aria-label="Filtry" />}>
				<ListFilterIcon className="size-4" />
				{!isMobile && 'Filtry'}
			</PopoverTrigger>
			<PopoverContent align="start" className="p-3">
				<div className="flex items-center justify-between gap-4">
					<Label htmlFor="archivedFilter">Archiv</Label>
					<Select
						id="archivedFilter"
						items={ARCHIVED}
						value={archivedFilter}
						// Base UI widens the value to `string | null`; this Select is never cleared.
						onValueChange={(value) => {
							if (value !== null) onArchivedFilterChange(value as ArchivedFilter)
						}}
					>
						<SelectTrigger className="w-50" size="sm">
							{/*  Base UI renders the raw value unless told how to label it.  */}
							<SelectValue>
								{(current) => ARCHIVED.find((i) => i.value === current)?.label}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{ARCHIVED.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
				{isInventura && (
					<div className="flex items-center justify-between gap-4">
						<Label htmlFor="checkedFilter">Inventura</Label>
						<Select
							id="checkedFilter"
							items={INVENTURA}
							value={inventuraFilter}
							// Base UI widens the value to `string | null`; this Select is never cleared.
							onValueChange={(value) => {
								if (value !== null) onInventuraFilterChange(value as CheckedFilter)
							}}
						>
							<SelectTrigger className="w-50" size="sm">
								{/*  Base UI renders the raw value unless told how to label it.  */}
								<SelectValue>
									{(current) => INVENTURA.find((i) => i.value === current)?.label}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{INVENTURA.map((item) => (
										<SelectItem key={item.value} value={item.value}>
											{item.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				)}
			</PopoverContent>
		</Popover>
	)
}
