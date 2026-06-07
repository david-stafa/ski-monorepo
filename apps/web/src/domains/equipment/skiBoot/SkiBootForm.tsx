import {
  createSkiBootInputSchema,
  type CreateSkiBootInput,
} from '@ski-blazek/api/schemas'
import type { SkiBoot } from '@ski-blazek/db/browser'
import { useAppForm } from '~/components/form/SharedFormFields'
import { useCreateSkiBoot, useUpdateSkiBoot } from './queries/skiBootQueries'

type FormType = CreateSkiBootInput
type FormMeta = { submitAction: 'close' | 'addAnother' | null }

type SkiBootFormProps = {
  close: () => void
  defaultValues?: Omit<SkiBoot, 'createdAt' | 'updatedAt'>
}

export const SkiBootForm = ({ close, defaultValues }: SkiBootFormProps) => {
  const isEdit = !!defaultValues
  const initialValues: FormType = {
    brand: defaultValues?.brand ?? '',
    model: defaultValues?.model ?? '',
    length: defaultValues?.length ?? 0,
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
        children={(field) => <field.TextField label="Značka" />}
      />

      <form.AppField
        name="model"
        children={(field) => <field.TextField label="Model" />}
      />

      <form.AppField
        name="length"
        children={(field) => <field.NumberField label="Délka" />}
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
