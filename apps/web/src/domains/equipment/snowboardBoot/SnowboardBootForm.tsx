import {
  createSnowboardBootInputSchema,
  type CreateSnowboardBootInput,
} from '@ski-blazek/api/schemas'
import type { SnowboardBoot } from '@ski-blazek/db/browser'
import { useAppForm } from '~/components/form/SharedFormFields'
import {
  useCreateSnowboardBoot,
  useUpdateSnowboardBoot,
} from './queries/snowboardBootQueries'

type FormType = CreateSnowboardBootInput
type FormMeta = { submitAction: 'close' | 'addAnother' | null }

type SnowboardBootFormProps = {
  close: () => void
  defaultValues?: Omit<SnowboardBoot, 'createdAt' | 'updatedAt'>
}

export const SnowboardBootForm = ({
  close,
  defaultValues,
}: SnowboardBootFormProps) => {
  const isEdit = !!defaultValues
  const initialValues: FormType = {
    brand: defaultValues?.brand ?? '',
    model: defaultValues?.model ?? '',
    length: defaultValues?.length ?? 0,
    isBoa: defaultValues?.isBoa ?? false,
  }

  const defaultMeta: FormMeta = {
    submitAction: null,
  }

  /**
   * Mutations
   */
  const createSnowboardBoot = useCreateSnowboardBoot()
  const updateSnowboardBoot = useUpdateSnowboardBoot()

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onChange: createSnowboardBootInputSchema,
    },
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      if (isEdit) {
        await updateSnowboardBoot.mutateAsync({ id: defaultValues.id, ...value })
      } else {
        await createSnowboardBoot.mutateAsync(value)
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

      <form.AppField
        name="isBoa"
        children={(field) => <field.CheckboxField label="BOA systém:" />}
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
            label={isEdit ? 'Uložit změny' : 'Vytvořit snowboardovou botu'}
            onClick={() => form.handleSubmit({ submitAction: 'close' })}
          />
        </form.AppForm>
      </div>
    </form>
  )
}
