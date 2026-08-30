import type { Goggle } from '@ski-blazek/db/browser'
import type { SelectFieldOption } from '~/components/form/SharedFormFields'

const goggleLabels: Record<Goggle, string> = {
	MALE: 'Pánské',
	FEMALE: 'Dámské',
	JUNIOR: 'Juniorské',
}

/**
 * Goggles used to be a yes/no flag; the variant replaces it because "yes" was
 * never enough for the counter — the staff still had to ask which pair. There
 * is no "none" entry: not taking goggles is the absence of a value, so it is
 * the `SelectField` none-option and the form value stays `null`, which is what
 * the column stores. See `genderOptions` for the same shape.
 */
export const goggleOptions: SelectFieldOption<Goggle>[] = (
	Object.keys(goggleLabels) as Goggle[]
).map((value) => ({ value, label: goggleLabels[value] }))

/** For the pick-up sheet and anywhere else a variant has to render as text. */
export const goggleLabel = (goggle: Goggle) => goggleLabels[goggle]
