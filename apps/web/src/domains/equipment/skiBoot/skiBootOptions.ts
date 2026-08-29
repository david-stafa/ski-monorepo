import type { SelectFieldOption } from '~/components/form/SharedFormFields'
import { numberRange } from '../_shared/helpers/numberRange'

const toOptions = (values: string[]): SelectFieldOption<string>[] =>
	values.map((value) => ({ value, label: value }))

/** See `skiBrandOptions` — same deal, the combobox still takes free text. */
export const skiBootBrandOptions = toOptions([
	'Atomic',
	'Dalbello',
	'Fischer',
	'Head',
	'K2',
	'Lange',
	'Nordica',
	'Rossignol',
	'Roxa',
	'Salomon',
	'Tecnica',
])

/**
 * Mondopoint 15–33 in half sizes. A closed list, unlike the ski lengths: boot
 * sizes are a standard scale, so anything off it is a typo rather than a boot.
 */
export const skiBootLengthOptions: SelectFieldOption<number>[] = numberRange(15, 33, 0.5).map(
	(length) => ({ value: length, label: String(length) })
)
