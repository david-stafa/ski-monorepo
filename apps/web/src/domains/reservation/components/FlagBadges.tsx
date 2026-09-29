import { Badge } from '@ski-blazek/ui/components/badge'
import { cn } from '@ski-blazek/ui/lib/utils'
import { TriangleAlertIcon } from 'lucide-react'

/*
 * Prep today, Late prep, Missed pickup and Overdue (see CONTEXT.md). Whether
 * something carries a flag is the API's call, so these only show it.
 */

type Flags = { prepToday: boolean; latePrep: boolean; missedPickup: boolean; overdue: boolean }

const PrepTodayBadge = () => <Badge variant="info">Připravit dnes</Badge>

const BehindBadge = ({ label }: { label: string }) => (
	<Badge variant="warning" className="font-semibold">
		<TriangleAlertIcon strokeWidth={2.5} />
		{label}
	</Badge>
)

/** Every flag a reservation, person or item carries, in lifecycle order — a
 * family can be a Missed pickup and Overdue at once. */
export const FlagBadges = ({ flags }: { flags: Flags }) => (
	<>
		{flags.prepToday && <PrepTodayBadge />}
		{flags.latePrep && <BehindBadge label="Nepřipraveno" />}
		{flags.missedPickup && <BehindBadge label="Nevyzvednuto" />}
		{flags.overdue && <BehindBadge label="Nevráceno" />}
	</>
)

const hasFlags = (flags: Flags) =>
	flags.prepToday || flags.latePrep || flags.missedPickup || flags.overdue

type FlagsOrStatusProps = {
	flags: Flags
	/** The status, shown when there is no flag. */
	status: React.ReactNode
	/** Stacked in a table's status column, side by side everywhere else. */
	direction: 'col' | 'row'
}

/**
 * A row's status spot: its flags if it has any, otherwise its status. Each
 * flag already says which status it is in, so nothing is lost (see
 * docs/reservation-status-display.md).
 */
export const FlagsOrStatus = ({ flags, status, direction }: FlagsOrStatusProps) => {
	if (!hasFlags(flags)) return status
	return (
		<span
			className={cn(
				'flex gap-1',
				direction === 'col' ? 'flex-col items-start' : 'flex-wrap items-center'
			)}
		>
			<FlagBadges flags={flags} />
		</span>
	)
}

/** Whether an item is behind — should have been prepared, collected or
 * brought back already — so its label should stand out. Prep today is still
 * on time. */
export const isItemBehind = (item: Flags) => item.latePrep || item.missedPickup || item.overdue
