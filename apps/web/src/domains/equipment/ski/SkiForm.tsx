import type { Ski } from '@ski-blazek/db/browser'
import z from 'zod'
import { useAppForm } from '~/components/form/SharedFormFields'
import { queryClient, trpc } from '~/lib/trpc'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

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
  const initialValues: FormType = defaultValues
    ? {
        ...defaultValues,
      }
    : {
        brand: '',
        model: '',
        length: 0,
        isVIP: false,
      }

  const defaultMeta: FormMeta = {
    submitAction: null,
  }

  const createSki = useMutation(
    trpc.equipment.ski.createSki.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.equipment.ski.getSki.queryKey(),
        }),
    })
  )

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onChange: formSchema,
    },
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      await createSki.mutateAsync(value)

      if (meta.submitAction === 'close') {
        close()
      }

      if (meta.submitAction === 'addAnother') {
        form.reset()
        toast.success('Lyže přidány', {
          description: 'Můžete přidat další.',
          position: 'top-right',
        })
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
          <form.SubscribeButton
            label="Vytvořit a přidat další"
            onClick={() => form.handleSubmit({ submitAction: 'addAnother' })}
            variant="secondary"
            className="mr-2"
          />
          <form.SubscribeButton
            label="Vytvořit lyže"
            onClick={() => form.handleSubmit({ submitAction: 'close' })}
          />
        </form.AppForm>
      </div>
    </form>
  )
}
