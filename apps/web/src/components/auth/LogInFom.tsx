import { Button } from '@ski-blazek/ui/components/button'
import { Input } from '@ski-blazek/ui/components/input'
import { Label } from '@ski-blazek/ui/components/label'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { authClient } from '~/lib/auth'
import { FieldInfo } from '../form/FieldInfo'

const userSchema = z.object({
  email: z.email(),
  password: z.string(),
})

type User = z.infer<typeof userSchema>

const defaultUser: User = {
  email: 'john.doe@example.com',
  password: 'password1234',
}

export const LogInForm = () => {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: defaultUser,
    validators: {
      onBlur: userSchema,
      onSubmit: userSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email({
        email: value.email,
        password: value.password,
        fetchOptions: {
          onSuccess: () => navigate({ to: '/dashboard' }),
          onError: (ctx) => {
            setFormError(ctx.error.message)
          },
        },
      })
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      {formError && <p className="text-destructive">{formError}</p>}
      <form.Field
        name="email"
        children={(field) => (
          <div>
            <Label htmlFor="login-email" className="mb-1">
              Email
            </Label>
            <Input
              id="login-email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              autoFocus
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
      <form.Field
        name="password"
        children={(field) => (
          <div>
            <Label htmlFor="login-password" className="mb-1">
              Password
            </Label>
            <Input
              id="login-password"
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? '...' : 'Log In'}
            </Button>
          </>
        )}
      />
    </form>
  )
}
