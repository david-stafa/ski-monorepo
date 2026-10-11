import { Gender } from '@ski-blazek/db/browser'
import { cn } from '@ski-blazek/ui/lib/utils'
import { MarsIcon, UserIcon, VenusIcon } from 'lucide-react'

const genderClassNames = 'inline-flex shrink-0 items-center justify-center rounded-full border p-1'

export const GenderIcon = ({ gender, size = 18 }: { gender: Gender; size?: number }) => {
	if (gender === Gender.MALE) {
		return (
			<span
				className={cn(
					genderClassNames,
					'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400'
				)}
				title="Muž"
				role="img"
				aria-label="Muž"
			>
				<MarsIcon size={size} />
			</span>
		)
	}

	if (gender === Gender.FEMALE) {
		return (
			<span
				className={cn(
					genderClassNames,
					'border-pink-500/50 bg-pink-500/10 text-pink-600 dark:text-pink-400'
				)}
				title="Žena"
				role="img"
				aria-label="Žena"
			>
				<VenusIcon size={size} />
			</span>
		)
	}

	return (
		<span className={cn(genderClassNames, 'border-border text-muted-foreground')}>
			<UserIcon size={size} />
		</span>
	)
}
