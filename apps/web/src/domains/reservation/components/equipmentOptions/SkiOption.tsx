import { GenderBadge } from '~/domains/equipment/_shared/components/badges/GenderBadge'
import { KidsBadge } from '~/domains/equipment/_shared/components/badges/KidsBadge'
import { LengthBadge } from '~/domains/equipment/_shared/components/badges/LengthBadge'
import { OldBadge } from '~/domains/equipment/_shared/components/badges/OldBadge'
import { VipBadge } from '~/domains/equipment/_shared/components/badges/VipBadge'
import type { SkiDetail } from '~/domains/equipment/_shared/types'
import { OptionName, OptionRow } from './OptionRow'

export const SkiOption = ({ article, ski }: { article: string; ski: SkiDetail }) => (
	<OptionRow
		article={article}
		flags={
			<>
				{/* Display Kids Badge only when it might be tricky to decide if it is adult or kid ski */}
				{ski.isKids && ski.length >= 140 && <KidsBadge />}
				{ski.gender === 'FEMALE' && <GenderBadge gender="FEMALE" isKid={ski.isKids} />}
				{ski.isOld && <OldBadge />}
				{ski.isVIP && <VipBadge />}
			</>
		}
	>
		<LengthBadge length={ski.length} />
		<OptionName brand={ski.brand} model={ski.model} />
	</OptionRow>
)
