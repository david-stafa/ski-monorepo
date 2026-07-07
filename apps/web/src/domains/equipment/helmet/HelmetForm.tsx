import {
  createHelmetInputSchema,
  type CreateHelmetInput,
} from '@ski-blazek/api/schemas'
import type { Helmet } from '@ski-blazek/db/browser'
import { useAppForm } from '~/components/form/SharedFormFields'
import { useCreateHelmet, useUpdateHelmet } from './queries/helmetQueries'

type FormType = CreateHelmetInput
type FormMeta = { submitAction: 'close' | 'addAnother' | null }

type HelmetFormProps = {
  close: () => void
  defaultValues?: Omit<Helmet, 'createdAt' | 'updatedAt'>
}

export const HelmetForm = ({ close, defaultValues }: HelmetFormProps) => {
  const isEdit = !!defaultValues
  const initialValues: FormType = {
    name: defaultValues?.name ?? '',
    size: defaultValues?.size ?? '',
    color: defaultValues?.color ?? '',
    description: defaultValues?.description ?? '',
    withIntegratedGoggles: defaultValues?.withIntegratedGoggles ?? false,
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
        name="name"
        children={(field) => <field.TextField label="Název" />}
      />

      <form.AppField
        name="size"
        children={(field) => <field.TextField label="Velikost" />}
      />

      <form.AppField
        name="color"
        children={(field) => <field.TextField label="Barva" />}
      />

      <form.AppField
        name="description"
        children={(field) => <field.TextField label="Popis" />}
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
