import type { CheckedFilter } from '@ski-blazek/api/schemas'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@ski-blazek/ui/components/select'

type CheckedFilterSelectProps = {
	value: CheckedFilter
	onValueChange: (value: CheckedFilter) => void
}

const options: { value: CheckedFilter; label: string }[] = [
	{ value: 'all', label: 'Vše' },
	{ value: 'unchecked', label: 'Nezkontrolováno' },
	{ value: 'checked', label: 'Zkontrolováno' },
]

/**
 * The working filter of an inventura: switch to "Nezkontrolováno" and the list
 * shrinks as you tick items off, so what's left on screen is what's left to find.
 */
export const CheckedFilterSelect = ({ value, onValueChange }: CheckedFilterSelectProps) => (
	<Select
		items={options}
		value={value}
		// Base UI widens the value to `string | null`; this Select is never cleared.
		onValueChange={(next) => {
			if (next !== null) onValueChange(next as CheckedFilter)
		}}
	>
		<SelectTrigger size="sm" className="w-45">
			{/*  Base UI renders the raw value unless told how to label it.  */}
			<SelectValue>{(current) => options.find((o) => o.value === current)?.label}</SelectValue>
		</SelectTrigger>
		<SelectContent>
			{options.map((option) => (
				<SelectItem key={option.value} value={option.value}>
					{option.label}
				</SelectItem>
			))}
		</SelectContent>
	</Select>
)
