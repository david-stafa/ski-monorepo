import { LengthBadge } from '~/domains/equipment/_shared/components/badges/LengthBadge'
import type { SnowboardDetail } from '~/domains/equipment/_shared/types'
import { OptionName, OptionRow } from './OptionRow'

/** No article number — the customer asked for snowboards without it. */
export const SnowboardOption = ({ snowboard }: { snowboard: SnowboardDetail }) => (
	<OptionRow>
		<LengthBadge length={snowboard.length} />
		<OptionName brand={snowboard.brand} model={snowboard.model} />
	</OptionRow>
)
