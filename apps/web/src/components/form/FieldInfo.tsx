import type { AnyFieldMeta } from '@tanstack/react-form'

// structural, not `AnyFieldApi`, so fields coming from a field group
// (`withFieldGroup`) are accepted too
export function FieldInfo({
  field,
}: {
  field: { state: { meta: AnyFieldMeta } }
}) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em className="text-destructive text-sm">
          {field.state.meta.errors.map((error) => error.message).join(' ')}
        </em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}
