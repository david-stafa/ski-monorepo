import { TypographyH2, TypographyP } from '@ski-blazek/ui/components/typography'
import { Link } from '@tanstack/react-router'
import { RegisterForm } from '~/components/auth/RegisterForm'

export const RegisterPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-full w-0 bg-slate-200 md:w-3/6" />
      <div className="flex w-full flex-col items-center p-14 md:w-3/6">
        <TypographyH2>Create your account</TypographyH2>
        <TypographyP className="text-muted-foreground mt-2 mb-6">
          Fill in the form below to create your account
        </TypographyP>
        <RegisterForm />
        <TypographyP className="text-muted-foreground mt-2 font-light">
          Already have an account?{' '}
          <Link to="/login" className="underline">
            Sign In
          </Link>
        </TypographyP>
      </div>
    </div>
  )
}
