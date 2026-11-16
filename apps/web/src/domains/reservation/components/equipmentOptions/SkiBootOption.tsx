import { KidsBadge } from '~/domains/equipment/_shared/components/badges/KidsBadge'
import { colorLabel } from '~/domains/equipment/_shared/helpers/colorOptions'
import type { SkiBootDetail } from '~/domains/equipment/_shared/types'
import { OptionName, OptionRow } from './OptionRow'

/** No mondopoint — the customer asked for ski boots without it. */
export const SkiBootOption = ({ article, boot }: { article: string; boot: SkiBootDetail }) => (
	<OptionRow article={article} flags={boot.isKids ? <KidsBadge /> : undefined}>
		<OptionName brand={boot.brand} model={boot.model} />
		{boot.color && <span className="text-muted-foreground">{colorLabel(boot.color)}</span>}
	</OptionRow>
)
