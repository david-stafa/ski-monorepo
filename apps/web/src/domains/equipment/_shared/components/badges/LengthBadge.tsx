import { Badge } from '@ski-blazek/ui/components/badge'

/**
 * The one measurement that decides whether a piece of gear fits. Skis and
 * snowboards are centimetres of board; boots are mondopoint, a scale of its
 * own — a 26.5 boot is not 26.5 cm of anything — so the unit is always printed
 * rather than assumed.
 */
export const LengthBadge = ({ length, unit = 'cm' }: { length: number; unit?: 'cm' | 'mp' }) => (
	<Badge variant="secondary" className="tabular-nums">
		{length} {unit}
	</Badge>
)
