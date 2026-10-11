import { Badge } from '@ski-blazek/ui/components/badge'
import { StarIcon } from 'lucide-react'

export const VipBadge = () => {
	return (
		<Badge variant="gold">
			<StarIcon />
			VIP
		</Badge>
	)
}
