import { Button } from '@ski-blazek/ui/components/button'
import { Input } from '@ski-blazek/ui/components/input'
import { Label } from '@ski-blazek/ui/components/label'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { signUpWithEmail } from '~/lib/auth'
import { FieldInfo } from '../form/FieldInfo'
import { useState } from 'react'

const userSchema = z
  .object({
    name: z.string(),
    email: z.email(),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((user) => user.password === user.confirmPassword, {
    error: "Passswords don't match",
    path: ['confirmPassword'],
  })

type User = z.infer<typeof userSchema>

const defaultUser: User = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'password1234',
  confirmPassword: 'password1234',
}

export const RegisterForm = () => {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: defaultUser,
    validators: {
      onBlur: userSchema,
      onSubmit: userSchema,
    },
    onSubmit: async ({ value }) => {
      const logIn = await signUpWithEmail(
        value.name,
        value.email,
        value.password
      )
      if (logIn.success) {
        navigate({ to: '/dashboard' })
      } else {
        setFormError(logIn.error.message)
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex w-full flex-col gap-4"
    >
      {formError && <p className="text-destructive">{formError}</p>}
      <form.Field
        name="name"
        children={(field) => (
          <div>
            <Label htmlFor="login-name" className="mb-1">
              Name
            </Label>
            <Input
              id="login-name"
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
      <form.Field
        name="confirmPassword"
        children={(field) => (
          <div>
            <Label htmlFor="login-password" className="mb-1">
              Confirm Password
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
              {isSubmitting ? '...' : 'Sign Up'}
            </Button>
          </>
        )}
      />
    </form>
  )
}
