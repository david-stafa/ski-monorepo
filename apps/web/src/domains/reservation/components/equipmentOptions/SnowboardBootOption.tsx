import { Badge } from '@ski-blazek/ui/components/badge'
import { KidsBadge } from '~/components/ui/badges/KidsBadge'
import { LengthBadge } from '~/components/ui/badges/LengthBadge'
import { OptionName, OptionRow } from './OptionRow'
import type { SnowboardBootDetail } from './types'

export const SnowboardBootOption = ({
	article,
	boot,
}: {
	article: string
	boot: SnowboardBootDetail
}) => (
	<OptionRow
		article={article}
		flags={
			<>
				{boot.isBoa && <Badge variant="outline">BOA</Badge>}
				{boot.isKids && <KidsBadge />}
			</>
		}
	>
		<LengthBadge length={boot.length} unit="mp" />
		<OptionName brand={boot.brand} model={boot.model} />
	</OptionRow>
)
