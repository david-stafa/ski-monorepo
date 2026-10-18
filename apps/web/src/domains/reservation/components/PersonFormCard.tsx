import { type EquipmentItemType, Gender } from '@ski-blazek/db/browser'
import { Button } from '@ski-blazek/ui/components/button'
import { TrashIcon } from 'lucide-react'
import { useState } from 'react'
import { withForm } from '~/components/form/SharedFormFields'
import { goggleOptions } from '../helpers/goggleOptions'
import { initialValues } from '../helpers/initialValues'
import { LEVEL_OPTIONS } from '../helpers/levelMeta'
import { poleOptions } from '../helpers/poleOptions'
import { EquipmentComboboxField } from './EquipmentComboboxField'
import { FormSection } from './FormSection'
import { GenderIcon } from './GenderIcon'
import { RemovePersonDialog } from './RemovePersonDialog'

export const PersonFormCard = withForm({
	// only read for type inference — the real values come from the parent form
	defaultValues: initialValues(),
	props: {
		index: 0,
		onRemove: () => {},
		// false once they hold gear that has been picked up (see getPersonEditLocks)
		canRemove: true,
		// already stored on the reservation, so removing them cancels them on save
		isSaved: false,
		// slots whose gear has been picked up or returned: shown, but not changeable
		lockedSlots: [] as EquipmentItemType[],
		excludeReservationId: undefined as string | undefined,
	},
	render: function PersonFormCard({
		form,
		index,
		onRemove,
		canRemove,
		isSaved,
		lockedSlots,
		excludeReservationId,
	}) {
		const [removeOpen, setRemoveOpen] = useState(false)

		return (
			<form.Subscribe
				selector={(s) => ({
					startDate: s.values.startDate,
					endDate: s.values.endDate,
				})}
			>
				{({ startDate, endDate }) => (
					// @container: the grids below reflow on the card's own width, which
					// shrinks next to the sticky sidebar on wide screens
					<div className="@container overflow-clip rounded-2xl border bg-background">
						<div className="flex items-center gap-3 border-b bg-muted/40 px-3 py-3 md:px-4">
							<form.Subscribe
								selector={(state) => state.values.people[index]?.gender}
								children={(gender) => <GenderIcon gender={gender ?? 'MALE'} />}
							/>
							<form.Subscribe
								selector={(state) => state.values.people[index]?.name}
								children={(name) => (
									<div className="flex min-w-0 flex-col">
										<span className="truncate font-medium text-lg leading-tight">
											{name || `Osoba ${index + 1}`}
										</span>
										{/* once named, the number moves down here */}
										{name && (
											<span className="text-muted-foreground text-xs">Osoba {index + 1}</span>
										)}
									</div>
								)}
							/>
							{index > 0 && canRemove && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="ml-auto text-muted-foreground hover:text-destructive"
									onClick={() => setRemoveOpen(true)}
								>
									<TrashIcon />
									<span className="hidden sm:inline">Odebrat</span>
									<span className="sr-only sm:hidden">Odebrat osobu</span>
								</Button>
							)}
							<RemovePersonDialog
								open={removeOpen}
								onOpenChange={setRemoveOpen}
								name={form.getFieldValue(`people[${index}].name`) || `Osoba ${index + 1}`}
								isSaved={isSaved}
								onRemove={onRemove}
							/>
						</div>

						<div className="divide-y">
							<FormSection title="Osobní údaje">
								{/* phones: name / three numbers / two selects, one row each; wide: all on one row */}
								<div className="grid grid-cols-6 gap-3">
									<div className="@4xl:col-span-1 col-span-6">
										<form.AppField name={`people[${index}].name`}>
											{(subField) => <subField.TextField label="Jméno" placeholder="Jméno" />}
										</form.AppField>
									</div>

									<div className="@4xl:col-span-1 col-span-2">
										<form.AppField name={`people[${index}].age`}>
											{(subField) => (
												<subField.NumberField label="Věk" placeholder="Věk" inputMode="numeric" />
											)}
										</form.AppField>
									</div>

									<div className="@4xl:col-span-1 col-span-2">
										<form.AppField name={`people[${index}].weight`}>
											{(subField) => (
												<subField.NumberField
													label="Váha (kg)"
													placeholder="Váha"
													inputMode="numeric"
												/>
											)}
										</form.AppField>
									</div>

									<div className="@4xl:col-span-1 col-span-2">
										<form.AppField name={`people[${index}].height`}>
											{(subField) => (
												<subField.NumberField
													label="Výška (cm)"
													placeholder="Výška"
													inputMode="numeric"
												/>
											)}
										</form.AppField>
									</div>

									<div className="@4xl:col-span-1 col-span-3">
										<form.AppField name={`people[${index}].gender`}>
											{(subField) => (
												<subField.SelectField
													label="Pohlaví"
													placeholder="Vyberte pohlaví"
													className="w-full"
													options={[
														{ value: Gender.FEMALE, label: 'Žena' },
														{ value: Gender.MALE, label: 'Muž' },
													]}
													withoutNoneOption
												/>
											)}
										</form.AppField>
									</div>

									<div className="@4xl:col-span-1 col-span-3">
										<form.AppField name={`people[${index}].level`}>
											{(subField) => (
												<subField.SelectField
													label="Zdatnost"
													placeholder="Vyberte..."
													className="w-full"
													options={LEVEL_OPTIONS}
												/>
											)}
										</form.AppField>
									</div>
								</div>
							</FormSection>

							<FormSection title="Lyže">
								<div className="grid @xl:grid-cols-[1fr_1fr_10rem] gap-3">
									<form.AppField name={`people[${index}].equipment.SKI`}>
										{() => (
											<EquipmentComboboxField
												label="Lyže"
												type="SKI"
												className="w-full"
												disabled={lockedSlots.includes('SKI')}
												startDate={startDate}
												endDate={endDate}
												excludeReservationId={excludeReservationId}
											/>
										)}
									</form.AppField>
									<form.AppField name={`people[${index}].equipment.SKI_BOOT`}>
										{() => (
											<EquipmentComboboxField
												label="Lyžařské boty"
												type="SKI_BOOT"
												className="w-full"
												disabled={lockedSlots.includes('SKI_BOOT')}
												startDate={startDate}
												endDate={endDate}
												excludeReservationId={excludeReservationId}
											/>
										)}
									</form.AppField>
									<form.AppField name={`people[${index}].poles`}>
										{(subField) => (
											<subField.SelectField
												label="Hole"
												placeholder="100 cm"
												className="w-full"
												options={poleOptions}
											/>
										)}
									</form.AppField>
								</div>
							</FormSection>

							<FormSection title="Snowboard">
								<div className="grid @xl:grid-cols-2 gap-3">
									<form.AppField name={`people[${index}].equipment.SNOWBOARD`}>
										{() => (
											<EquipmentComboboxField
												label="Snowboard"
												type="SNOWBOARD"
												className="w-full"
												disabled={lockedSlots.includes('SNOWBOARD')}
												startDate={startDate}
												endDate={endDate}
												excludeReservationId={excludeReservationId}
											/>
										)}
									</form.AppField>
									<form.AppField name={`people[${index}].equipment.SNOWBOARD_BOOT`}>
										{() => (
											<EquipmentComboboxField
												label="Snowboardové boty"
												type="SNOWBOARD_BOOT"
												className="w-full"
												disabled={lockedSlots.includes('SNOWBOARD_BOOT')}
												startDate={startDate}
												endDate={endDate}
												excludeReservationId={excludeReservationId}
											/>
										)}
									</form.AppField>
								</div>
							</FormSection>

							<FormSection title="Helma a brýle">
								<div className="grid @xl:grid-cols-[1fr_10rem] gap-3">
									<form.AppField name={`people[${index}].equipment.HELMET`}>
										{() => (
											<EquipmentComboboxField
												label="Helma"
												type="HELMET"
												className="w-full"
												disabled={lockedSlots.includes('HELMET')}
												startDate={startDate}
												endDate={endDate}
												excludeReservationId={excludeReservationId}
											/>
										)}
									</form.AppField>
									<form.AppField name={`people[${index}].goggles`}>
										{(subField) => (
											<subField.SelectField
												label="Brýle"
												placeholder="Bez brýlí"
												noneLabel="Bez brýlí"
												className="w-full"
												options={goggleOptions}
											/>
										)}
									</form.AppField>
								</div>
							</FormSection>

							<FormSection title="Doplňky a poznámka">
								<div className="flex flex-wrap gap-2">
									<div className="rounded-lg border px-3 py-2">
										<form.AppField name={`people[${index}].skiCover`}>
											{(subField) => <subField.CheckboxField label="Obal na lyže" />}
										</form.AppField>
									</div>
									<div className="rounded-lg border px-3 py-2">
										<form.AppField name={`people[${index}].bootCover`}>
											{(subField) => <subField.CheckboxField label="Obal na boty" />}
										</form.AppField>
									</div>
									<div className="rounded-lg border px-3 py-2">
										<form.AppField name={`people[${index}].backProtection`}>
											{(subField) => <subField.CheckboxField label="Páteřák" />}
										</form.AppField>
									</div>
								</div>
								<form.AppField name={`people[${index}].note`}>
									{(subField) => (
										<subField.TextAreaField
											label="Poznámka"
											placeholder="Např. preferuje kratší lyže"
										/>
									)}
								</form.AppField>
							</FormSection>
						</div>
					</div>
				)}
			</form.Subscribe>
		)
	},
})
