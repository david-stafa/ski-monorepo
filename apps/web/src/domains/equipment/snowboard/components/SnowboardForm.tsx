import {
  createSnowboardInputSchema,
  type CreateSnowboardInput,
} from '@ski-blazek/api/schemas'
import { useAppForm } from '~/components/form/SharedFormFields'
import { useCreateSnowboard, useUpdateSnowboard } from '../snowboardQueries'
import type { SnowboardListItem } from '../snowboard.types'

type FormType = CreateSnowboardInput
type FormMeta = { submitAction: 'close' | 'addAnother' | null }

type SnowboardFormProps = {
  close: () => void
  defaultValues?: SnowboardListItem
}

export const SnowboardForm = ({ close, defaultValues }: SnowboardFormProps) => {
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
  const createSnowboard = useCreateSnowboard()
  const updateSnowboard = useUpdateSnowboard()

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onChange: createSnowboardInputSchema,
    },
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      if (isEdit) {
        await updateSnowboard.mutateAsync({ id: defaultValues.id, ...value })
      } else {
        await createSnowboard.mutateAsync(value)
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
            label={isEdit ? 'Uložit změny' : 'Vytvořit snowboard'}
            onClick={() => form.handleSubmit({ submitAction: 'close' })}
          />
        </form.AppForm>
      </div>
    </form>
  )
}
