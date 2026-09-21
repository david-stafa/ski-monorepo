import { KidsBadge } from '~/components/ui/badges/KidsBadge'
import { LengthBadge } from '~/components/ui/badges/LengthBadge'
import { OldBadge } from '~/components/ui/badges/OldBadge'
import { VipBadge } from '~/components/ui/badges/VipBadge'
import { OptionName, OptionRow } from './OptionRow'
import type { SkiDetail } from './types'

export const SkiOption = ({ article, ski }: { article: string; ski: SkiDetail }) => (
	<OptionRow
		article={article}
		flags={
			<>
				{/* Display Kids Badge only when it might be tricky to decide if it is adult or kid ski */}
				{ski.isKids && ski.length >= 140 && <KidsBadge />}
				{ski.isOld && <OldBadge />}
				{ski.isVIP && <VipBadge />}
			</>
		}
	>
		<LengthBadge length={ski.length} />
		<OptionName brand={ski.brand} model={ski.model} />
	</OptionRow>
)
