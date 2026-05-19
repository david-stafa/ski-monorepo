import {
  TypographyH2,
  TypographyP,
} from '@ski-blazek/ui/components/typography'
import { LogInForm } from '~/components/auth/LogInFom'

export const LogInPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-full w-0 bg-slate-200 md:w-3/6" />
      <div className="flex w-full flex-col items-center p-14 md:w-3/6">
        <TypographyH2>Log in to your account</TypographyH2>
        <TypographyP className="text-muted-foreground mt-2 mb-6">
          Fill the form below to log in to your account
        </TypographyP>
        <LogInForm />
      </div>  
    </div>
  )
}
