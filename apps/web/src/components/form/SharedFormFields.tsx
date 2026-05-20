import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { Button } from '@ski-blazek/ui/components/button'
import { Checkbox } from '@ski-blazek/ui/components/checkbox'
import { Input } from '@ski-blazek/ui/components/input'
import { Label } from '@ski-blazek/ui/components/label'
import { FieldInfo } from './FieldInfo'

const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

function TextField({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Input>) {
  const field = useFieldContext<string>()
  return (
    <>
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FieldInfo field={field} />
    </>
  )
}

function NumberField({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Input>) {
  const field = useFieldContext<number>()
  return (
    <>
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        type="number"
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        {...props}
      />
      <FieldInfo field={field} />
    </>
  )
}

function CheckboxField({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Checkbox>) {
  const field = useFieldContext<boolean>()
  return (
    <div className="flex gap-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Checkbox
        id={field.name}
        className="h-6 w-6"
        checked={field.state.value}
        onBlur={field.handleBlur}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
        {...props}
      />
      <FieldInfo field={field} />
    </div>
  )
}

function SubscribeButton({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Button>) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button disabled={isSubmitting} {...props}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    CheckboxField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
