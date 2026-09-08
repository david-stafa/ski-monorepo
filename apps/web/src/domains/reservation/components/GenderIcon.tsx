import { Gender } from '@ski-blazek/db/browser'
import { cn } from '@ski-blazek/ui/lib/utils'
import { MarsIcon, UserIcon, VenusIcon } from 'lucide-react'

const genderClassNames = 'shrink-0 rounded-full p-1 overflow-clip'

export const GenderIcon = ({ gender, size = 18 }: { gender: Gender; size?: number }) => {
	if (gender === Gender.MALE) {
		return (
			<div className={cn(genderClassNames, 'bg-blue-500 text-primary-foreground')}>
				<MarsIcon size={size} />
			</div>
		)
	}

	if (gender === Gender.FEMALE) {
		return (
			<div className={cn(genderClassNames, 'bg-pink-500 text-primary-foreground dark:bg-pink-400')}>
				<VenusIcon size={size} />
			</div>
		)
	}

	return (
		<div className={cn(genderClassNames, 'bg-muted text-muted-foreground')}>
			<UserIcon size={size} />
		</div>
	)
}
