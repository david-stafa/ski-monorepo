import type { HelmetSize } from '@ski-blazek/db/browser'
import type { SelectFieldOption } from '~/components/form/SharedFormFields'

const toOptions = (values: string[]): SelectFieldOption<string>[] =>
	values.map((value) => ({ value, label: value }))

/** See `skiBrandOptions` — same deal, the combobox still takes free text. */
export const helmetBrandOptions = toOptions([
	'Alpina',
	'Atomic',
	'Brico',
	'Giro',
	'Head',
	'K2',
	'Marker',
	'POC',
	'Rossignol',
	'Salomon',
	'Uvex',
])

/**
 * Colours are stored in English and shown in Czech: the value is a stable key
 * that does not move when the wording does, and it is what a swatch or an
 * export would key off. `helmetColorLabel` turns it back into Czech for tables.
 *
 * A swatch cannot be built by interpolating the value into a class name —
 * Tailwind only emits CSS for complete class strings it can find in the source,
 * so `bg-${color}` compiles to nothing. Map the value to a literal class.
 */
const helmetColorLabels: Record<string, string> = {
	black: 'Černá',
	white: 'Bílá',
	grey: 'Šedá',
	silver: 'Stříbrná',
	blue: 'Modrá',
	red: 'Červená',
	green: 'Zelená',
	yellow: 'Žlutá',
	orange: 'Oranžová',
	pink: 'Růžová',
	purple: 'Fialová',
}

/** Still creatable, so a one-off shade needs no code change. */
export const helmetColorOptions: SelectFieldOption<string>[] = Object.entries(
	helmetColorLabels
).map(([value, label]) => ({ value, label }))

/**
 * For table cells. A colour typed in by hand is not in the map, so it stands in
 * for itself rather than rendering as blank.
 */
export const helmetColorLabel = (color: string) => helmetColorLabels[color] ?? color

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
