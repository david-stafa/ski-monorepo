import { Badge } from '@ski-blazek/ui/components/badge'
import { KidsBadge } from '~/domains/equipment/_shared/components/badges/KidsBadge'
import { LengthBadge } from '~/domains/equipment/_shared/components/badges/LengthBadge'
import type { SnowboardBootDetail } from '~/domains/equipment/_shared/types'
import { OptionName, OptionRow } from './OptionRow'

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
