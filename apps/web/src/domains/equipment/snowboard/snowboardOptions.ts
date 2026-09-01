import type { SelectFieldOption } from '~/components/form/SharedFormFields'
import { numberRange } from '../_shared/helpers/numberRange'

const toOptions = (values: string[]): SelectFieldOption<string>[] =>
	values.map((value) => ({ value, label: value }))

/** See `skiBrandOptions` — same deal, the combobox still takes free text. */
export const snowboardBrandOptions = toOptions([
	'Burton',
	'Capita',
	'GNU',
	'Gravity',
	'Head',
	'K2',
	'Lib Tech',
	'Nidecker',
	'Nitro',
	'Ride',
	'Rossignol',
	'Salomon',
])

/** 90–170 cm in 5 cm steps. */
export const snowboardLengthOptions: SelectFieldOption<number>[] = numberRange(90, 170, 5).map(
	(length) => ({ value: length, label: `${length} cm` })
)
