import { Button } from '@ski-blazek/ui/components/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { useTheme } from '@ski-blazek/ui/components/theme-provider'
import { cn } from '@ski-blazek/ui/lib/utils'
import { useNavigate, useRouteContext } from '@tanstack/react-router'
import { LogOut, Monitor, Moon, Sun, UserRound } from 'lucide-react'
import { useState } from 'react'

import { authClient } from '~/lib/auth'

export function UserMenu() {
	const navigate = useNavigate()
	const { user } = useRouteContext({ from: '__root__' })
	const { setTheme, theme } = useTheme()
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

	const words = (user?.name || '').trim().split(/\s+/).filter(Boolean)
	const initials = words
		.slice(0, 2)
		.map((word) => word[0])
		.join('')
		.toUpperCase()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="secondary" size="icon" className="rounded-full" />}
			>
				{initials ? (
					<span className="font-medium text-xs">{initials}</span>
				) : (
					<UserRound className="size-4" />
				)}
				<span className="sr-only">Uživatelské menu</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				<DropdownMenuGroup>
					<DropdownMenuLabel>{user?.name || user?.email}</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => setTheme('light')}
					className={cn(theme === 'light' && 'bg-accent text-accent-foreground')}
				>
					<Sun className="size-4" />
					Světlý
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme('dark')}
					className={cn(theme === 'dark' && 'bg-accent text-accent-foreground')}
				>
					<Moon className="size-4" />
					Tmavý
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme('system')}
					className={cn(theme === 'system' && 'bg-accent text-accent-foreground')}
				>
					<Monitor className="size-4" />
					Systémový
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
					<LogOut className="size-4" />
					{isLoading ? 'Odhlašuji se…' : 'Odhlásit se'}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
