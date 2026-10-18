import {
	createEmptyEquipment,
	type ReservationDetail,
	type ReservationInput,
	reservationInputSchema,
	seasonPickupDate,
	seasonReturnDeadline,
} from '@ski-blazek/api/schemas'
import { Button } from '@ski-blazek/ui/components/button'
import { TypographyH1 } from '@ski-blazek/ui/components/typography'
import { useNavigate } from '@tanstack/react-router'
import { FileTextIcon, UserPlusIcon } from 'lucide-react'
import { useState } from 'react'
import { DateRangeField } from '~/components/form/DateRangeField'
import { useAppForm, withForm } from '~/components/form/SharedFormFields'
import { createEmptyPerson } from '../helpers/createEmptyPerson'
import { getPersonEditLocks } from '../helpers/getPersonEditLocks'
import { type InitialValuesProps, initialValues } from '../helpers/initialValues'
import { useCreateReservation, useUpdateReservation } from '../reservationQueries'
import { FormSection } from './FormSection'
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
					const pickUp = seasonPickupDate(formApi.state.values.startDate)
					// e.g. prefilled from a fitting — the end date is already right
					if (
						deadline.getTime() === formApi.state.values.endDate.getTime() &&
						pickUp.getTime() === formApi.state.values.startDate.getTime()
					)
						return

					formApi.setFieldValue('endDate', deadline)
					formApi.setFieldValue('startDate', pickUp)
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
				await navigate({
					to: '/reservation/$reservationId',
					params: { reservationId: reservation.id },
				})
			} else {
				const created = await createReservation.mutateAsync(value)

				await navigate({
					to: '/reservation/$reservationId',
					params: { reservationId: created.reservation.id },
				})
			}
		},
	})

	const submitLabel = isEdit ? 'Uložit změny' : 'Vytvořit rezervaci'

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<TypographyH1>{isEdit ? 'Upravit rezervaci' : 'Vytvořit rezervaci'}</TypographyH1>
				<p className="text-muted-foreground text-sm">
					{isEdit
						? 'Termín a sezónnost u existující rezervace změnit nelze.'
						: 'Vyplňte termín a kontakt, pak vybavení pro každou osobu.'}
				</p>
			</div>
			<form
				// one column on phones; from xl the reservation details stick to the
				// left while the people scroll past on the right
				className="flex flex-col gap-4 xl:grid xl:grid-cols-[22rem_minmax(0,1fr)] xl:items-start xl:gap-6"
				onSubmit={(e) => {
					e.preventDefault()
					e.stopPropagation()
					form.handleSubmit()
				}}
			>
				<div className="flex flex-col gap-4 xl:sticky xl:top-4">
					<section className="@container overflow-clip rounded-2xl border bg-background">
						<div className="flex items-center gap-3 border-b bg-muted/40 px-3 py-3 md:px-4">
							<FileTextIcon
								className="rounded-full bg-primary p-1.5 text-primary-foreground"
								size={30}
							/>
							<span className="font-medium text-lg">Základní údaje</span>
						</div>
						<div className="divide-y">
							<FormSection title="Termín">
								<div className="flex flex-wrap items-start gap-x-6 gap-y-3">
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
												label="Sezónní"
												disabled={isEdit}
												orientation="stacked"
											/>
										)}
									/>
								</div>
							</FormSection>
							<FormSection title="Kontakt">
								<div className="grid @sm:grid-cols-2 gap-3">
									<form.AppField
										name="name"
										children={(field) => (
											<field.TextField label="Jméno" placeholder="Zadejte jméno" />
										)}
									/>
									<form.AppField
										name="phoneNumber"
										children={(field) => (
											<field.TextField
												label="Telefon"
												placeholder="123 456 789"
												type="tel"
												inputMode="tel"
											/>
										)}
									/>
								</div>
								<form.AppField
									name="note"
									children={(field) => (
										<field.TextAreaField label="Poznámka" placeholder="Zadejte poznámku" />
									)}
								/>
							</FormSection>
						</div>
					</section>

					{/* the save button lives here on wide screens; phones get the bar at the bottom */}
					<div className="hidden flex-col gap-3 rounded-2xl border bg-muted/40 p-4 xl:flex">
						<ReservationSummary form={form} compact={false} />
						<form.AppForm>
							<form.SubscribeButton label={submitLabel} size="lg" className="w-full" />
						</form.AppForm>
					</div>
				</div>

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
								{peopleField.state.value.map((person, i) => {
									const saved = reservation?.people.find(({ id }) => id === person.id)
									const { lockedSlots, canRemove } = getPersonEditLocks(saved)
									return (
										<PersonFormCard
											key={personKeys[i]}
											form={form}
											index={i}
											onRemove={() => removePerson(i)}
											canRemove={canRemove}
											isSaved={saved !== undefined}
											lockedSlots={lockedSlots}
											excludeReservationId={reservation?.id}
										/>
									)
								})}
								<Button
									onClick={addPerson}
									type="button"
									variant="outline"
									size="lg"
									className="h-14 rounded-2xl border-dashed text-muted-foreground"
								>
									<UserPlusIcon />
									Přidat další osobu
								</Button>
							</div>
						)
					}}
				</form.AppField>

				{/* sticks to the bottom of the screen while the form is scrolled */}
				<div className="sticky bottom-0 -mx-2 flex items-center gap-3 border-t bg-background/95 px-3 py-3 backdrop-blur md:-mx-4 md:px-4 xl:hidden">
					<div className="min-w-0 flex-1">
						<ReservationSummary form={form} compact />
					</div>
					<form.AppForm>
						<form.SubscribeButton label={submitLabel} size="lg" />
					</form.AppForm>
				</div>
			</form>
		</div>
	)
}

/** How many people and how much gear the reservation holds so far. */
const ReservationSummary = withForm({
	// only read for type inference — the real values come from the parent form
	defaultValues: initialValues(),
	props: { compact: false },
	render: function ReservationSummary({ form, compact }) {
		return (
			<form.Subscribe
				selector={(state) => ({
					people: state.values.people.length,
					gear: state.values.people.reduce(
						(count, person) => count + Object.values(person.equipment).filter(Boolean).length,
						0
					),
				})}
			>
				{({ people, gear }) =>
					compact ? (
						<p className="truncate text-muted-foreground text-sm">
							Osob: <b className="text-foreground">{people}</b> · Vybavení:{' '}
							<b className="text-foreground">{gear}</b>
						</p>
					) : (
						<dl className="grid grid-cols-2 gap-3 text-sm">
							<div className="rounded-lg border bg-background p-3">
								<dt className="text-muted-foreground">Osob</dt>
								<dd className="font-semibold text-2xl">{people}</dd>
							</div>
							<div className="rounded-lg border bg-background p-3">
								<dt className="text-muted-foreground">Vybavení</dt>
								<dd className="font-semibold text-2xl">{gear}</dd>
							</div>
						</dl>
					)
				}
			</form.Subscribe>
		)
	},
})
