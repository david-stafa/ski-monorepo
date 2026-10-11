import { KidsBadge } from '~/domains/equipment/_shared/components/badges/KidsBadge'
import { LengthBadge } from '~/domains/equipment/_shared/components/badges/LengthBadge'
import { colorLabel } from '~/domains/equipment/_shared/helpers/colorOptions'
import type { SkiBootDetail } from '~/domains/equipment/_shared/types'
import { OptionName, OptionRow } from './OptionRow'

export const SkiBootOption = ({ article, boot }: { article: string; boot: SkiBootDetail }) => (
	<OptionRow article={article} flags={boot.isKids ? <KidsBadge /> : undefined}>
		<LengthBadge length={boot.length} unit="mp" />
		<OptionName brand={boot.brand} model={boot.model} />
		{boot.color && <span className="text-muted-foreground">{colorLabel(boot.color)}</span>}
	</OptionRow>
)
