import { Badge } from '@ski-blazek/ui/components/badge'
import { colorLabel } from '~/domains/equipment/_shared/helpers/colorOptions'
import { formatCircumference, helmetSizeLabel } from '~/domains/equipment/helmet/helmetOptions'
import { OptionName, OptionRow } from './OptionRow'
import type { HelmetDetail } from './types'

export const HelmetOption = ({ article, helmet }: { article: string; helmet: HelmetDetail }) => {
	// Both are optional until stocktaking fills them in, so each drops out on its
	// own rather than rendering the table dash in a picker row.
	const hasCircumference = helmet.circumferenceMin !== null && helmet.circumferenceMax !== null

	return (
		<OptionRow
			article={article}
			flags={helmet.withIntegratedGoggles ? <Badge variant="outline">S brýlemi</Badge> : undefined}
		>
			{helmet.size && <Badge variant="secondary">{helmetSizeLabel(helmet.size)}</Badge>}
			<OptionName brand={helmet.brand} model={helmet.model} />
			<span className="text-muted-foreground">{colorLabel(helmet.color)}</span>
			{hasCircumference && (
				<span className="text-muted-foreground text-xs tabular-nums">
					{formatCircumference(helmet.circumferenceMin, helmet.circumferenceMax)}
				</span>
			)}
		</OptionRow>
	)
}
