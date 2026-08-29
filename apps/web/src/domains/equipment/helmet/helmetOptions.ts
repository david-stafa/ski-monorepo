import type { SelectFieldOption } from '~/components/form/SharedFormFields'

const toOptions = (values: string[]): SelectFieldOption<string>[] =>
	values.map((value) => ({ value, label: value }))

/** See `skiBrandOptions` — same deal, the combobox still takes free text. */
export const helmetBrandOptions = toOptions([
	'Alpina',
	'Atomic',
	'Bollé',
	'Giro',
	'Head',
	'K2',
	'Marker',
	'POC',
	'Rossignol',
	'Salomon',
	'Smith',
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
