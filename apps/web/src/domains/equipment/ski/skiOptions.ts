import type { SelectFieldOption } from '~/components/form/SharedFormFields'
import { numberRange } from '../_shared/helpers/numberRange'

const toOptions = (values: string[]): SelectFieldOption<string>[] =>
	values.map((value) => ({ value, label: value }))

/**
 * The brands worth one keystroke instead of ten. Hand-maintained — add one by
 * editing this array. It does not have to be exhaustive: the combobox accepts
 * anything typed in, so a one-off brand never needs a code change.
 */
export const skiBrandOptions = toOptions([
	'Atomic',
	'Blizzard',
	'Dynastar',
	'Elan',
	'Fischer',
	'Head',
	'K2',
	'Nordica',
	'Rossignol',
	'Salomon',
	'Völkl',
])

/** 70–190 cm in 5 cm steps: kids' skis at the bottom, adult at the top. */
export const skiLengthOptions: SelectFieldOption<number>[] = numberRange(70, 190, 5).map(
	(length) => ({ value: length, label: `${length} cm` })
)
