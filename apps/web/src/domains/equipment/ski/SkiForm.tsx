import { Button } from '@ski-blazek/ui/components/button'
import { Input } from '@ski-blazek/ui/components/input'
import { Label } from '@ski-blazek/ui/components/label'
import { Checkbox } from '@ski-blazek/ui/components/checkbox'
import { useForm } from '@tanstack/react-form'
import z from 'zod'
import { FieldInfo } from '~/components/form/FieldInfo'
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

export const SkiForm = ({ close }: { close: () => void }) => {
  const defaultValues: FormType = {
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

  const form = useForm({
    defaultValues: defaultValues,
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
      <form.Field
        name="brand"
        children={(field) => (
          <>
            <Label htmlFor="brand">Značka</Label>
            <Input
              id="brand"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </>
        )}
      />
      <form.Field
        name="model"
        children={(field) => (
          <>
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </>
        )}
      />
      <form.Field
        name="length"
        children={(field) => (
          <>
            <Label htmlFor="length">Délka</Label>
            <Input
              type="number"
              id="length"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
            />
            <FieldInfo field={field} />
          </>
        )}
      />

      <form.Field
        name="isVIP"
        children={(field) => (
          <div className="flex gap-2">
            <Label htmlFor="isVIP">Jsou VIP:</Label>
            <Checkbox
              id="isVIP"
              className="h-6 w-6"
              checked={field.state.value}
              onBlur={field.handleBlur}
              onCheckedChange={(checked) =>
                field.handleChange(checked === true)
              }
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
      <div className="ml-auto">
        <Button
          type="submit"
          variant="secondary"
          className="mr-2"
          disabled={form.state.isSubmitting}
          onClick={() => form.handleSubmit({ submitAction: 'addAnother' })}
        >
          Vytvořit a přidat další
        </Button>
        <Button
          type="submit"
          disabled={form.state.isSubmitting}
          onClick={() => form.handleSubmit({ submitAction: 'close' })}
        >
          Vytvořit lyže
        </Button>
      </div>
    </form>
  )
}
