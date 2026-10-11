import { LengthBadge } from '~/domains/equipment/_shared/components/badges/LengthBadge'
import type { SnowboardDetail } from '~/domains/equipment/_shared/types'
import { OptionName, OptionRow } from './OptionRow'

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
