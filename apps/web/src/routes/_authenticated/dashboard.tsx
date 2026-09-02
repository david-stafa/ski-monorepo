import { Button } from '@ski-blazek/ui/components/button'
import { ModeToggle } from '@ski-blazek/ui/components/mode-toggle'
import { TypographyH2 } from '@ski-blazek/ui/components/typography'
import { createFileRoute, useNavigate, useRouteContext } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '~/lib/auth'

export const Route = createFileRoute('/_authenticated/dashboard')({
	component: Dashboard,
})

function Dashboard() {
	const navigate = useNavigate()
	const { user } = useRouteContext({ from: '__root__' })
	const [isLoading, setIsLoading] = useState(false)

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onRequest: () => setIsLoading(true),
				onSuccess: () => {
					setIsLoading(false)
					navigate({ to: '/' })
				},
				onError: (ctx) => {
					setIsLoading(false)
					console.error(ctx.error.message)
				},
			},
		})
	}

	return (
		<div className="flex justify-between">
			<TypographyH2 className="mb-4">Welcome, {user?.name}.</TypographyH2>
			<div className="mb-4 items-center justify-end gap-1 hidden md:flex">
				<ModeToggle />
				<Button onClick={handleSignOut} variant="secondary" disabled={isLoading}>
					<LogOut className="size-4" />
					{isLoading ? 'Odhlašuji se…' : 'Odhlásit se'}
				</Button>
			</div>
		</div>
	)
}
