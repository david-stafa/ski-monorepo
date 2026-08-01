import { createReservationInputSchema } from '@ski-blazek/api/schemas'
import { Button } from '@ski-blazek/ui/components/button'
import { Separator } from '@ski-blazek/ui/components/separator'
import {
  TypographyH1,
  TypographyH4,
} from '@ski-blazek/ui/components/typography'
import { FileTextIcon } from 'lucide-react'
import { useState } from 'react'
import { DateRangeField } from '~/components/form/DateRangeField'
import { useAppForm } from '~/components/form/SharedFormFields'
import { createEmptyEquipment } from '../helpers/createEmptyEquipment'
import { createEmptyPerson } from '../helpers/createEmptyPerson'
import { useCreateReservation } from '../reservationQueries'
import { PersonFormCard } from './PersonFormCard'
import { initialValues } from '../helpers/initialValues'

export const ReservationForm = () => {
  const createReservation = useCreateReservation()

  // TanStack Form's array API has no row ids, and the array index is not a
  // stable React key — once a row can be removed, index keys hand a row's
  // mounted state (including each EquipmentSelectField's query) to its
  // neighbour. Form values stay identical to the API payload, so identity
  // lives beside them and is mutated in lockstep with the array.
  const [personKeys, setPersonKeys] = useState<string[]>(() => [
    crypto.randomUUID(),
  ])

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onChange: createReservationInputSchema,
    },
    listeners: {
      // availability is date-dependent, so a range change can silently
      // invalidate gear already picked — drop every selection and make the
      // user re-pick from the new availability list
      onChange: ({ formApi, fieldApi }) => {
        if (fieldApi.name !== 'startDate' && fieldApi.name !== 'endDate') return

        formApi.state.values.people.forEach((person, i) => {
          const hasSelection = Object.values(person.equipment).some(Boolean)
          if (!hasSelection) return
          formApi.setFieldValue(
            `people[${i}].equipment`,
            createEmptyEquipment()
          )
        })
      },
    },
    onSubmit: async ({ value }) => {
      const reservation = await createReservation.mutateAsync(value)

      if (reservation) {
        form.reset()
        setPersonKeys([crypto.randomUUID()])
      }
    },
  })

  return (
    <div>
      <TypographyH1 className="mb-6">Vytvořit rezervaci</TypographyH1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <FileTextIcon
              className="bg-primary text-primary-foreground rounded-full p-1.5"
              size={30}
            />
            <TypographyH4>Základní údaje</TypographyH4>
          </div>
          <DateRangeField
            form={form}
            fields={{ startDate: 'startDate', endDate: 'endDate' }}
            label="Termín rezervace"
          />
          <div className="flex gap-2">
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
                  placeholder="Zadejte telefonní číslo"
                />
              )}
            />
          </div>

          <form.AppField
            name="note"
            children={(field) => (
              <field.TextAreaField
                label="Poznámka"
                placeholder="Zadejte poznámku"
              />
            )}
          />
        </section>

        <Separator className="my-4" />

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
            label="Vytvořit rezervaci"
            className="w-full"
            size={'lg'}
          />
        </form.AppForm>
      </form>
    </div>
  )
}
