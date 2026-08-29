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
 * The colours worth one keystroke. Czech, to match the rest of the form — and
 * still creatable, so a "matná antracitová" that only one shell has needs no
 * code change.
 */
export const helmetColorOptions = toOptions([
	'Bílá',
	'Černá',
	'Červená',
	'Fialová',
	'Modrá',
	'Oranžová',
	'Růžová',
	'Stříbrná',
	'Šedá',
	'Zelená',
	'Žlutá',
])
