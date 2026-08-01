import { Gender, Level } from '@ski-blazek/db/browser'
import { Button } from '@ski-blazek/ui/components/button'
import { TypographyH4 } from '@ski-blazek/ui/components/typography'
import { TrashIcon, UserIcon } from 'lucide-react'
import { withForm } from '~/components/form/SharedFormFields'
import { EquipmentSelectField } from './EquipmentSelectField'
import { poleOptions } from '../helpers/poleOptions'
import { initialValues } from '../helpers/initialValues'

export const PersonFormCard = withForm({
  defaultValues: initialValues,
  props: { index: 0, onRemove: () => {} },
  render: function PersonFormCard({ form, index, onRemove }) {
    return (
      <form.Subscribe
        selector={(s) => ({
          startDate: s.values.startDate,
          endDate: s.values.endDate,
        })}
      >
        {({ startDate, endDate }) => (
          <div className="bg-muted/40 flex flex-col gap-4 rounded-xl border p-2 md:p-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <UserIcon
                  className="bg-primary text-primary-foreground rounded-full p-1.5"
                  size={30}
                />
                <TypographyH4>Osoba {index + 1}</TypographyH4>
              </div>
              <Button
                size={'icon-sm'}
                type="button"
                disabled={index === 0}
                hidden={index === 0}
                onClick={() => onRemove()}
              >
                <TrashIcon />
              </Button>
            </div>

            <section className="flex gap-4">
              <form.AppField name={`people[${index}].name`}>
                {(subField) => (
                  <subField.TextField label="Jméno" placeholder="Jméno osoby" />
                )}
              </form.AppField>

              <form.AppField name={`people[${index}].age`}>
                {(subField) => (
                  <subField.NumberField label="Věk" placeholder="Věk osoby" />
                )}
              </form.AppField>

              <form.AppField name={`people[${index}].weight`}>
                {(subField) => (
                  <subField.NumberField label="Váha" placeholder="Váha osoby" />
                )}
              </form.AppField>

              <form.AppField name={`people[${index}].height`}>
                {(subField) => (
                  <subField.NumberField
                    label="Výška"
                    placeholder="Výška osoby"
                  />
                )}
              </form.AppField>

              <form.AppField name={`people[${index}].gender`}>
                {(subField) => (
                  <subField.SelectField
                    label="Pohlaví"
                    placeholder="Vyberte pohlaví"
                    options={[
                      { value: Gender.FEMALE, label: 'Žena' },
                      { value: Gender.MALE, label: 'Muž' },
                    ]}
                    withoutNoneOption
                  />
                )}
              </form.AppField>

              <form.AppField name={`people[${index}].level`}>
                {(subField) => (
                  <subField.SelectField
                    label="Zdatnost"
                    placeholder="Vyberte zdatnost"
                    options={[
                      { value: Level.BEGINNER, label: 'Začátečník - L' },
                      {
                        value: Level.BEGINNER_INTERMEDIATE,
                        label: 'Lepší začátečník - L/A',
                      },
                      { value: Level.INTERMEDIATE, label: 'Pokročilý - L' },
                      {
                        value: Level.INTERMEDIATE_EXPERT,
                        label: 'Středně pokročilý - A/S',
                      },
                      { value: Level.EXPERT, label: 'Expert - S' },
                    ]}
                  />
                )}
              </form.AppField>
            </section>

            <section className="flex gap-4">
              <form.AppField name={`people[${index}].equipment.SKI`}>
                {() => (
                  <EquipmentSelectField
                    label="Lyže"
                    type="SKI"
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}
              </form.AppField>
              <form.AppField name={`people[${index}].equipment.SKI_BOOT`}>
                {() => (
                  <EquipmentSelectField
                    label="Lyžařské boty"
                    type="SKI_BOOT"
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}
              </form.AppField>
              <form.AppField name={`people[${index}].poles`}>
                {(subField) => (
                  <subField.SelectField
                    label="Hole"
                    placeholder="Zadejte délku holí"
                    className="max-w-45"
                    options={poleOptions}
                  />
                )}
              </form.AppField>
            </section>
            <section className="flex gap-4">
              <form.AppField name={`people[${index}].equipment.SNOWBOARD`}>
                {() => (
                  <EquipmentSelectField
                    label="Snowboard"
                    type="SNOWBOARD"
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}
              </form.AppField>
              <form.AppField name={`people[${index}].equipment.SNOWBOARD_BOOT`}>
                {() => (
                  <EquipmentSelectField
                    label="Snowboardové boty"
                    type="SNOWBOARD_BOOT"
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}
              </form.AppField>
            </section>
            <section className="flex gap-4">
              <form.AppField name={`people[${index}].equipment.HELMET`}>
                {() => (
                  <EquipmentSelectField
                    label="Helma"
                    type="HELMET"
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}
              </form.AppField>
              <form.AppField name={`people[${index}].goggles`}>
                {(subField) => (
                  <subField.CheckboxField label="Brýle" orientation="stacked" />
                )}
              </form.AppField>
            </section>

            <section className="flex gap-6">
              <form.AppField name={`people[${index}].skiCover`}>
                {(subField) => <subField.CheckboxField label="Obal na lyže" />}
              </form.AppField>

              <form.AppField name={`people[${index}].bootCover`}>
                {(subField) => <subField.CheckboxField label="Obal na boty" />}
              </form.AppField>

              <form.AppField name={`people[${index}].backProtection`}>
                {(subField) => <subField.CheckboxField label="Páteřák" />}
              </form.AppField>
            </section>
            <form.AppField name={`people[${index}].note`}>
              {(subField) => <subField.TextAreaField label="Poznámka" />}
            </form.AppField>
          </div>
        )}
      </form.Subscribe>
    )
  },
})
