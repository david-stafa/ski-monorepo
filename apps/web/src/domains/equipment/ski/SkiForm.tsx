import type { Ski } from '@ski-blazek/db/browser'
import z from 'zod'
import { useAppForm } from '~/components/form/SharedFormFields'
import { useCreateSki, useUpdateSki } from './queries/skiQueries'

const formSchema = z.object({
  brand: z.string().min(2),
  model: z.string().min(2),
  length: z.number().min(50),
  isVIP: z.boolean(),
})

type FormType = z.infer<typeof formSchema>
type FormMeta = { submitAction: 'close' | 'addAnother' | null }

type SkiFormProps = {
  close: () => void
  defaultValues?: Omit<Ski, 'createdAt' | 'updatedAt'>
}

export const SkiForm = ({ close, defaultValues }: SkiFormProps) => {
  const isEdit = !!defaultValues
  const initialValues: FormType = {
    brand: defaultValues?.brand ?? '',
    model: defaultValues?.model ?? '',
    length: defaultValues?.length ?? 0,
    isVIP: defaultValues?.isVIP ?? false,
  }

  const defaultMeta: FormMeta = {
    submitAction: null,
  }

  /**
   * Mutations
   */
  const createSki = useCreateSki()
  const updateSki = useUpdateSki()

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onChange: formSchema,
    },
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      if (isEdit) {
        await updateSki.mutateAsync({ id: defaultValues.id, ...value })
      } else {
        await createSki.mutateAsync(value)
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
        name="isVIP"
        children={(field) => <field.CheckboxField label="Jsou VIP:" />}
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
            label={isEdit ? 'Uložit změny' : 'Vytvořit lyže'}
            onClick={() => form.handleSubmit({ submitAction: 'close' })}
          />
        </form.AppForm>
      </div>
    </form>
  )
}
