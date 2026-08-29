import type { SelectFieldOption } from '~/components/form/SharedFormFields'
import { numberRange } from '../_shared/helpers/numberRange'

const toOptions = (values: string[]): SelectFieldOption<string>[] =>
	values.map((value) => ({ value, label: value }))

/** See `skiBrandOptions` — same deal, the combobox still takes free text. */
export const snowboardBootBrandOptions = toOptions([
	'Burton',
	'DC',
	'Gravity',
	'Head',
	'K2',
	'Nidecker',
	'Nitro',
	'Ride',
	'Rossignol',
	'Salomon',
	'ThirtyTwo',
	'Vans',
])

/** Mondopoint 18–33 in half sizes. Closed list — see `skiBootLengthOptions`. */
export const snowboardBootLengthOptions: SelectFieldOption<number>[] = numberRange(18, 33, 0.5).map(
	(length) => ({
		value: length,
		label: String(length),
	})
)
