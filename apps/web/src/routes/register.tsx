import { createFileRoute, redirect } from '@tanstack/react-router'
import { RegisterPage } from '~/domains/auth/RegisterPage'

// Registration is closed. Accounts are created with `pnpx auth create-admin`
// (see packages/auth/README.md). The API is the real boundary — better-auth is
// configured with `emailAndPassword.disableSignUp`, so sign-up returns
// EMAIL_PASSWORD_SIGN_UP_DISABLED even if this route is reached directly.
//
// The route and its form are kept for the planned staff-accounts work: drop the
// `beforeLoad` to bring it back.
export const Route = createFileRoute('/register')({
	beforeLoad: () => {
		throw redirect({ to: '/' })
	},
	component: RegisterPage,
})
