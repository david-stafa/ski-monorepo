import type { SelectFieldOption } from '~/components/form/SharedFormFields'

/**
 * Colours are stored in English and shown in Czech: the value is a stable key
 * that does not move when the wording does, and it is what a swatch or an
 * export would key off. `colorLabel` turns it back into Czech for tables.
 *
 * Shared rather than per-type — a black helmet and a black boot are the same
 * colour, and two copies of this map would drift the moment one gains a shade.
 *
 * A swatch cannot be built by interpolating the value into a class name —
 * Tailwind only emits CSS for complete class strings it can find in the source,
 * so `bg-${color}` compiles to nothing. Map the value to a literal class.
 */
const colorLabels: Record<string, string> = {
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
export const colorOptions: SelectFieldOption<string>[] = Object.entries(colorLabels).map(
	([value, label]) => ({ value, label })
)

/**
 * For table cells. A colour typed in by hand is not in the map, so it stands in
 * for itself rather than rendering as blank; a boot with no colour recorded
 * renders the same dash the other unmeasured fields use.
 */
export const colorLabel = (color: string | null) =>
	color === null ? '—' : (colorLabels[color] ?? color)
