import {
	createEmptyEquipment,
	type ReservationDetail,
	type ReservationInput,
	reservationInputSchema,
	seasonReturnDeadline,
} from '@ski-blazek/api/schemas'
import { Button } from '@ski-blazek/ui/components/button'
import { TypographyH1, TypographyH4 } from '@ski-blazek/ui/components/typography'
import { useNavigate } from '@tanstack/react-router'
import { FileTextIcon } from 'lucide-react'
import { useState } from 'react'
import { DateRangeField } from '~/components/form/DateRangeField'
import { useAppForm } from '~/components/form/SharedFormFields'
import { createEmptyPerson } from '../helpers/createEmptyPerson'
import { type InitialValuesProps, initialValues } from '../helpers/initialValues'
import { useCreateReservation, useUpdateReservation } from '../reservationQueries'
import { PersonFormCard } from './PersonFormCard'

type ReservationFormProps = {
	reservation?: ReservationDetail
	searchParams?: InitialValuesProps
}

export const ReservationForm = ({ reservation, searchParams }: ReservationFormProps) => {
	const isEdit = Boolean(reservation?.id)
	const navigate = useNavigate()
	const createReservation = useCreateReservation()
	const updateReservation = useUpdateReservation()

	const defaultValues: ReservationInput = reservation ?? initialValues(searchParams)

	// TanStack Form's array API has no row ids, and the array index is not a
	// stable React key — once a row can be removed, index keys hand a row's
	// mounted state (including each EquipmentComboboxField's query) to its
	// neighbour. Form values stay identical to the API payload, so identity
	// lives beside them and is mutated in lockstep with the array. An existing
	// person already carries a stable id; only new rows need one made up.
	const [personKeys, setPersonKeys] = useState<string[]>(() =>
		defaultValues.people.map((person) => person.id ?? crypto.randomUUID())
	)

	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: reservationInputSchema,
		},
		listeners: {
			// availability is date-dependent, so a range change can silently
			// invalidate gear already picked — drop every selection and make the
			// user re-pick from the new availability list
			onChange: ({ formApi, fieldApi }) => {
				// TODO: Clear only the gear that is no longer available, rather than all of it
				// This is the reasong why date range is disabled in edit mode
				const clearPickedGear = () => {
					formApi.state.values.people.forEach((person, i) => {
						const hasSelection = Object.values(person.equipment).some(Boolean)
						if (!hasSelection) return
						formApi.setFieldValue(`people[${i}].equipment`, createEmptyEquipment())
					})
				}

				// Ticking Seasonal fills in the season return deadline as the end date.
				// Unticking leaves the dates alone.
				if (fieldApi.name === 'seasonal') {
					if (!fieldApi.state.value) return

					const deadline = seasonReturnDeadline(formApi.state.values.startDate)
					// e.g. prefilled from a fitting — the end date is already right
					if (deadline.getTime() === formApi.state.values.endDate.getTime()) return

					formApi.setFieldValue('endDate', deadline)
					clearPickedGear()
					return
				}

				if (fieldApi.name === 'startDate' || fieldApi.name === 'endDate') {
					clearPickedGear()
				}
			},
		},
		onSubmit: async ({ value }) => {
			// An edit writes back to the row it was loaded from and leaves the
			// edit screen, so there is nothing to reset.
			if (reservation) {
				await updateReservation.mutateAsync({ ...value, id: reservation.id })
				await navigate({ to: '/reservation' })
			} else {
				const created = await createReservation.mutateAsync(value)

				if (created) {
					// reset to a blank form, not the defaults — a form prefilled from a
					// fitting would otherwise come back with the same customer in it
					form.reset(initialValues())
					setPersonKeys([crypto.randomUUID()])
					await navigate({ to: '/reservation/create' })
				}
			}
		},
	})

	return (
		<div>
			<TypographyH1 className="mb-6">
				{isEdit ? 'Upravit rezervaci' : 'Vytvořit rezervaci'}
			</TypographyH1>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					e.stopPropagation()
					form.handleSubmit()
				}}
			>
				<section className="bg-muted/40 mb-4 flex flex-col gap-4 rounded-xl border p-2 md:p-4">
					<div className="flex items-center gap-2">
						<FileTextIcon
							className="bg-primary text-primary-foreground rounded-full p-1.5"
							size={30}
						/>
						<TypographyH4>Základní údaje</TypographyH4>
					</div>
					<div className="flex gap-4 items-center">
						<DateRangeField
							disabled={isEdit}
							form={form}
							fields={{ startDate: 'startDate', endDate: 'endDate' }}
							label="Termín rezervace"
						/>
						{/* create-only, like the dates: shown on edit so staff can see it */}
						<form.AppField
							name="seasonal"
							children={(field) => (
								<field.CheckboxField
									label="Sezónní rezervace"
									disabled={isEdit}
									orientation="stacked"
								/>
							)}
						/>
					</div>
					<div className="flex gap-2">
						<form.AppField
							name="name"
							children={(field) => <field.TextField label="Jméno" placeholder="Zadejte jméno" />}
						/>

						<form.AppField
							name="phoneNumber"
							children={(field) => <field.TextField label="Telefon" placeholder="123 456 789" />}
						/>
					</div>

					<form.AppField
						name="note"
						children={(field) => (
							<field.TextAreaField label="Poznámka" placeholder="Zadejte poznámku" />
						)}
					/>
				</section>

				<form.AppField name="people" mode="array">
					{(peopleField) => {
						// personKeys and the people array must only ever change
						// together — a desync misaligns every row's React key
						const addPerson = () => {
							setPersonKeys((keys) => [...keys, crypto.randomUUID()])
							peopleField.pushValue(createEmptyPerson())
						}

						const removePerson = (index: number) => {
							setPersonKeys((keys) => keys.filter((_, i) => i !== index))
							peopleField.removeValue(index)
						}

						return (
							<div className="flex flex-col gap-4">
								{peopleField.state.value.map((_, i) => (
									<PersonFormCard
										key={personKeys[i]}
										form={form}
										index={i}
										onRemove={() => removePerson(i)}
										excludeReservationId={reservation?.id}
									/>
								))}
								<Button
									onClick={addPerson}
									type="button"
									variant={'outline'}
									className="mb-4"
									size={'lg'}
								>
									Přidat další osobu
								</Button>
							</div>
						)
					}}
				</form.AppField>

				<form.AppForm>
					<form.SubscribeButton
						label={isEdit ? 'Uložit změny' : 'Vytvořit rezervaci'}
						className="w-full"
						size={'lg'}
					/>
				</form.AppForm>
			</form>
		</div>
	)
}
