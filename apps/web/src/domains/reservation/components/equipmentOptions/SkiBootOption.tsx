import { KidsBadge } from '~/components/ui/badges/KidsBadge'
import { LengthBadge } from '~/components/ui/badges/LengthBadge'
import { colorLabel } from '~/domains/equipment/_shared/helpers/colorOptions'
import { OptionName, OptionRow } from './OptionRow'
import type { SkiBootDetail } from './types'

export const SkiBootOption = ({ article, boot }: { article: string; boot: SkiBootDetail }) => (
	<OptionRow article={article} flags={boot.isKids ? <KidsBadge /> : undefined}>
		<LengthBadge length={boot.length} unit="mp" />
		<OptionName brand={boot.brand} model={boot.model} />
		{boot.color && <span className="text-muted-foreground">{colorLabel(boot.color)}</span>}
	</OptionRow>
)
