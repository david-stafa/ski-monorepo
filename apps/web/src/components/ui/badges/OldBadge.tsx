import { Badge } from '@ski-blazek/ui/components/badge'
import { HistoryIcon } from 'lucide-react'

export const OldBadge = () => {
	return (
		<Badge variant="outline">
			<HistoryIcon />
			Starší
		</Badge>
	)
}
