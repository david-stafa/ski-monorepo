import { type CreateSkiBootInput, createSkiBootInputSchema } from '@ski-blazek/api/schemas'
import { useAppForm } from '~/components/form/SharedFormFields'
import { genderOptions } from '../../_shared/helpers/genderOptions'
import type { SkiBootListItem } from '../skiBoot.types'
import { skiBootBrandOptions, skiBootLengthOptions } from '../skiBootOptions'
import { useCreateSkiBoot, useUpdateSkiBoot } from '../skiBootQueries'

type FormType = CreateSkiBootInput
type FormMeta = { submitAction: 'close' | 'addAnother' | null }

type SkiBootFormProps = {
	close: () => void
	defaultValues?: SkiBootListItem
}

export const SkiBootForm = ({ close, defaultValues }: SkiBootFormProps) => {
	const isEdit = !!defaultValues
	const initialValues: FormType = {
		brand: defaultValues?.brand ?? '',
		model: defaultValues?.model ?? '',
		length: defaultValues?.length ?? 0,
		gender: defaultValues?.gender ?? null,
	}

	const defaultMeta: FormMeta = {
		submitAction: null,
	}

	/**
	 * Mutations
	 */
	const createSkiBoot = useCreateSkiBoot()
	const updateSkiBoot = useUpdateSkiBoot()

	const form = useAppForm({
		defaultValues: initialValues,
		validators: {
			onChange: createSkiBootInputSchema,
		},
		onSubmitMeta: defaultMeta,
		onSubmit: async ({ value, meta }) => {
			if (isEdit) {
				await updateSkiBoot.mutateAsync({ id: defaultValues.id, ...value })
			} else {
				await createSkiBoot.mutateAsync(value)
			}

			if (meta.submitAction === 'close') {
				close()
			}

			if (meta.submitAction === 'addAnother') {
				form.reset()
			}
		},
	})

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
			}}
			className="flex flex-col gap-2"
		>
			<form.AppField
				name="brand"
				children={(field) => (
					<field.CreatableComboboxField
						label="Značka"
						options={skiBootBrandOptions}
						placeholder="Vyberte značku"
					/>
				)}
			/>

			<form.AppField name="model" children={(field) => <field.TextField label="Model" />} />

			<form.AppField
				name="length"
				children={(field) => (
					<field.NumberComboboxField
						label="Délka"
						options={skiBootLengthOptions}
						placeholder="Vyberte velikost"
					/>
				)}
			/>

			<form.AppField
				name="gender"
				children={(field) => (
					<field.SelectField
						label="Pohlaví"
						options={genderOptions}
						noneLabel="Unisex"
						placeholder="Unisex"
					/>
				)}
			/>

			<div className="ml-auto">
				<form.AppForm>
					{!isEdit && (
						<form.SubscribeButton
							label={'Vytvořit a přidat další'}
							onClick={() => form.handleSubmit({ submitAction: 'addAnother' })}
							variant="secondary"
							className="mr-2"
						/>
					)}
					<form.SubscribeButton
						label={isEdit ? 'Uložit změny' : 'Vytvořit lyžařskou botu'}
						onClick={() => form.handleSubmit({ submitAction: 'close' })}
					/>
				</form.AppForm>
			</div>
		</form>
	)
}
