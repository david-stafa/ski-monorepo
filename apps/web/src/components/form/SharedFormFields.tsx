import { Button } from '@ski-blazek/ui/components/button'
import { Checkbox } from '@ski-blazek/ui/components/checkbox'
import { Input } from '@ski-blazek/ui/components/input'
import { Label } from '@ski-blazek/ui/components/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@ski-blazek/ui/components/select'
import { Textarea } from '@ski-blazek/ui/components/textarea'
import { cn } from '@ski-blazek/ui/lib/utils'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { FieldInfo } from './FieldInfo'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

function TextField({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Input>) {
  const field = useFieldContext<string>()
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FieldInfo field={field} />
    </div>
  )
}

function TextAreaField({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Textarea>) {
  const field = useFieldContext<string | null>()
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Textarea
        id={field.name}
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FieldInfo field={field} />
    </div>
  )
}

function NumberField({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Input>) {
  const field = useFieldContext<number | null>()
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        type="number"
        id={field.name}
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(
            e.target.value === '' ? null : e.target.valueAsNumber
          )
        }
        {...props}
      />
      <FieldInfo field={field} />
    </div>
  )
}

function CheckboxField({
  label,
  orientation = 'inline',
  className,
  ...props
}: {
  label: string
  /**
   * `inline` puts the label beside the box — right for a group of standalone
   * toggles. `stacked` puts it above, matching TextField/SelectField, so the
   * field lines up when it shares a row with them.
   */
  orientation?: 'inline' | 'stacked'
} & React.ComponentProps<typeof Checkbox>) {
  const field = useFieldContext<boolean>()
  const checkbox = (
    <Checkbox
      id={field.name}
      checked={field.state.value}
      onBlur={field.handleBlur}
      onCheckedChange={(checked) => field.handleChange(checked === true)}
      className={cn('h-6 w-6', className)}
      {...props}
    />
  )

  if (orientation === 'stacked') {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={field.name}>{label}</Label>
        {/* h-9 is the Input / SelectTrigger height, so the box sits on the
            same line as the controls next to it */}
        <div className="flex h-9 items-center">{checkbox}</div>
        <FieldInfo field={field} />
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Label htmlFor={field.name}>{label}</Label>
      {checkbox}
      <FieldInfo field={field} />
    </div>
  )
}

export type SelectFieldOption<TValue extends string | number = string> = {
  value: TValue
  label: string
  disabled?: boolean
}

const NONE_VALUE = '__none__'

/**
 * Presentational only — it takes ready-made options. Anything that has to
 * *fetch* its options composes this from its own domain folder rather than
 * pulling data-loading into the shared form kit.
 *
 * Radix's Select only speaks strings, so option values are stringified on the
 * way in and mapped back to the original option on the way out — that keeps a
 * numeric field (pole length) numeric in form state.
 */
export function SelectField<TValue extends string | number = string>({
  label,
  options,
  placeholder,
  isLoading = false,
  withoutNoneOption = false,
  className,
  ...props
}: {
  label: string
  options: SelectFieldOption<TValue>[]
  placeholder?: string
  isLoading?: boolean
  withoutNoneOption?: boolean
  className?: string
} & React.ComponentProps<typeof Select>) {
  const field = useFieldContext<TValue | null>()
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Select
        // '' rather than null keeps the Select controlled while empty, so it
        // doesn't flip between controlled and uncontrolled on first pick
        value={field.state.value == null ? '' : String(field.state.value)}
        onValueChange={(value) => {
          if (value === NONE_VALUE) return field.handleChange(null)
          const option = options.find((o) => String(o.value) === value)
          field.handleChange(option ? option.value : null)
        }}
        disabled={isLoading}
        {...props}
      >
        <SelectTrigger
          id={field.name}
          onBlur={field.handleBlur}
          className={className ?? 'w-full max-w-48'}
        >
          <SelectValue
            placeholder={
              isLoading ? 'Načítání…' : (placeholder ?? `Vyberte ${label}`)
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {!withoutNoneOption && (
              <SelectItem value={NONE_VALUE}>Žádné</SelectItem>
            )}
            {options.map((option) => (
              <SelectItem
                value={String(option.value)}
                key={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
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

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    CheckboxField,
    TextAreaField,
    SelectField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
