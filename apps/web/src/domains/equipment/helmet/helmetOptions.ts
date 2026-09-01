import type { HelmetSize } from '@ski-blazek/db/browser'
import type { SelectFieldOption } from '~/components/form/SharedFormFields'

const toOptions = (values: string[]): SelectFieldOption<string>[] =>
	values.map((value) => ({ value, label: value }))

/**
 * See `skiBrandOptions` — same deal, the combobox still takes free text.
 */
export const helmetBrandOptions = toOptions([
	'Briko',
	'Cébé',
	'Etape',
	'Etto',
	'Lange',
	'Mango',
	'Midida',
	'Razer',
	'Relax',
	'Salomon',
	'SH+',
	'Wedze',
])

const helmetSizeLabels: Record<HelmetSize, string> = {
	XS: 'XS',
	S: 'S',
	M: 'M',
	L: 'L',
	XL: 'XL',
	ADJUSTABLE: 'Nastavitelná',
}

/**
 * Declaration order, which is small-to-large — the same order the API sorts by,
 * so the dropdown and the sorted column agree. Stretchy shells span several
 * letters, and rather than list every combination ("XS-S", "S-M", …) they all
 * pick `ADJUSTABLE` and let the circumference range say how wide they go.
 */
export const helmetSizeOptions: SelectFieldOption<HelmetSize>[] = (
	Object.keys(helmetSizeLabels) as HelmetSize[]
).map((value) => ({ value, label: helmetSizeLabels[value] }))

/** For table cells, where an unmeasured helmet still has to render as something. */
export const helmetSizeLabel = (size: HelmetSize | null) => (size ? helmetSizeLabels[size] : '—')

/**
 * A fixed helmet is stored as a range whose ends are equal, so it would print
 * as "56–56 cm" unless collapsed here. Both null means it has not been measured
 * yet; the schema keeps the pair from ever being half-filled.
 */
export const formatCircumference = (min: number | null, max: number | null) => {
	if (min === null || max === null) return '—'
	return min === max ? `${min} cm` : `${min}–${max} cm`
}
