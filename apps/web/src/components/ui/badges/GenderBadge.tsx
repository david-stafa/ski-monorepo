import { Gender } from '@ski-blazek/db/browser'
import { Badge } from '@ski-blazek/ui/components/badge'
import { CircleSmallIcon, MarsIcon, VenusIcon } from 'lucide-react'

export const GenderBadge = ({
	gender,
	isKid = false,
}: {
	gender: Gender | null
	isKid?: boolean
}) => {
	if (gender === Gender.MALE) {
		return (
			<Badge variant="blue">
				<MarsIcon />
				{isKid ? 'Klučíčí' : 'Pánské'}
			</Badge>
		)
	} else if (gender === Gender.FEMALE) {
		return (
			<Badge variant="pink">
				<VenusIcon />
				{isKid ? 'Dívčí' : 'Dámské'}
			</Badge>
		)
	} else {
		return (
			<Badge variant="secondary">
				<CircleSmallIcon />
				Unisex
			</Badge>
		)
	}
}
