import type { Gender } from '@ski-blazek/db/browser'
import type { SelectFieldOption } from '~/components/form/SharedFormFields'

const genderLabels: Record<Gender, string> = {
	MALE: 'Klučičí',
	FEMALE: 'Holčičí',
}

/**
 * Only the two real values. "Unisex" is the absence of one, so it is the
 * `SelectField` none-option (`noneLabel="Unisex"`) rather than an entry here —
 * that keeps the form value `null`, which is what the column stores.
 */
export const genderOptions: SelectFieldOption<Gender>[] = [
	{ value: 'MALE', label: genderLabels.MALE },
	{ value: 'FEMALE', label: genderLabels.FEMALE },
]

/** For table cells, where `null` has to render as something. */
export const genderLabel = (gender: Gender | null) =>
	gender === null ? 'Unisex' : genderLabels[gender]
