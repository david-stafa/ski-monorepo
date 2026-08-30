import { type CreateHelmetInput, createHelmetInputSchema } from '@ski-blazek/api/schemas'
import { useAppForm } from '~/components/form/SharedFormFields'
import { genderOptions } from '../../_shared/helpers/genderOptions'
import type { HelmetListItem } from '../helmet.types'
import { helmetBrandOptions, helmetColorOptions, helmetSizeOptions } from '../helmetOptions'
import { useCreateHelmet, useUpdateHelmet } from '../helmetQueries'

type FormType = CreateHelmetInput
type FormMeta = { submitAction: 'close' | 'addAnother' | null }

type HelmetFormProps = {
	close: () => void
	defaultValues?: HelmetListItem
}

export const HelmetForm = ({ close, defaultValues }: HelmetFormProps) => {
	const isEdit = !!defaultValues
	const initialValues: FormType = {
		brand: defaultValues?.brand ?? '',
		model: defaultValues?.model ?? null,
		size: defaultValues?.size ?? null,
		circumferenceMin: defaultValues?.circumferenceMin ?? null,
		circumferenceMax: defaultValues?.circumferenceMax ?? null,
		color: defaultValues?.color ?? '',
		description: defaultValues?.description ?? '',
		withIntegratedGoggles: defaultValues?.withIntegratedGoggles ?? false,
		gender: defaultValues?.gender ?? null,
	}

	const defaultMeta: FormMeta = {
		submitAction: null,
	}

	/**
	 * Mutations
	 */
	const createHelmet = useCreateHelmet()
	const updateHelmet = useUpdateHelmet()

	const form = useAppForm({
		defaultValues: initialValues,
		validators: {
			onChange: createHelmetInputSchema,
		},
		listeners: {
			// A fixed-size helmet is stored as a range with equal ends, so the form
			// only ever shows it one input and mirrors it into the other. Doing that
			// here rather than on submit keeps form state identical to the payload,
			// so the schema's min/max rules validate what will actually be saved.
			onChange: ({ formApi, fieldApi }) => {
				if (fieldApi.name !== 'size' && fieldApi.name !== 'circumferenceMin') return
				if (formApi.state.values.size === 'ADJUSTABLE' || formApi.state.values.size === null) return

				formApi.setFieldValue('circumferenceMax', formApi.state.values.circumferenceMin)
			},
		},
		onSubmitMeta: defaultMeta,
		onSubmit: async ({ value, meta }) => {
			if (isEdit) {
				await updateHelmet.mutateAsync({ id: defaultValues.id, ...value })
			} else {
				await createHelmet.mutateAsync(value)
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
						options={helmetBrandOptions}
						placeholder="Vyberte značku"
					/>
				)}
			/>

			<form.AppField name="model" children={(field) => <field.TextField label="Model" />} />

			<form.AppField
				name="size"
				children={(field) => (
					<field.SelectField
						label="Velikost"
						options={helmetSizeOptions}
						noneLabel="Neuvedena"
						placeholder="Neuvedena"
					/>
				)}
			/>

			{/* Only an adjustable shell spans a range, so every other helmet gets a
			    single "Obvod" input and never has to type the same number twice. */}
			<form.Subscribe
				selector={(state) => state.values.size}
				children={(size) =>
					size === null || size === 'ADJUSTABLE' ? (
						<div className="flex gap-2">
							<form.AppField
								name="circumferenceMin"
								children={(field) => <field.NumberField label="Obvod od (cm)" />}
							/>
							<form.AppField
								name="circumferenceMax"
								children={(field) => <field.NumberField label="Obvod do (cm)" />}
							/>
						</div>
					) : (
						<form.AppField
							name="circumferenceMin"
							children={(field) => <field.NumberField label="Obvod (cm)" />}
						/>
					)
				}
			/>

			<form.AppField
				name="color"
				children={(field) => (
					<field.CreatableComboboxField
						label="Barva"
						options={helmetColorOptions}
						placeholder="Vyberte barvu"
					/>
				)}
			/>

			<form.AppField name="description" children={(field) => <field.TextField label="Popis" />} />

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

			<form.AppField
				name="withIntegratedGoggles"
				children={(field) => <field.CheckboxField label="Integrované brýle:" />}
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
						label={isEdit ? 'Uložit změny' : 'Vytvořit helmu'}
						onClick={() => form.handleSubmit({ submitAction: 'close' })}
					/>
				</form.AppForm>
			</div>
		</form>
	)
}
