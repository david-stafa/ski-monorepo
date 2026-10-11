import { Button } from '@ski-blazek/ui/components/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@ski-blazek/ui/components/dropdown-menu'
import { useTheme } from '@ski-blazek/ui/components/theme-provider'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '../lib/utils'

export function ModeToggle() {
	const { setTheme, theme } = useTheme()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="secondary" size="icon" />}>
				<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				<span className="sr-only">Přepnout motiv</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
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
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
