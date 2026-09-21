import { LengthBadge } from '~/components/ui/badges/LengthBadge'
import { OptionName, OptionRow } from './OptionRow'
import type { SnowboardDetail } from './types'

export const SnowboardOption = ({
	article,
	snowboard,
}: {
	article: string
	snowboard: SnowboardDetail
}) => (
	<OptionRow article={article}>
		<LengthBadge length={snowboard.length} />
		<OptionName brand={snowboard.brand} model={snowboard.model} />
	</OptionRow>
)
