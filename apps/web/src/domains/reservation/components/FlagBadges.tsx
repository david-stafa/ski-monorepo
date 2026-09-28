import { Badge } from '@ski-blazek/ui/components/badge'

/*
 * Prep today, Late prep, Missed pickup and Overdue (see CONTEXT.md). Whether
 * something carries a flag is the API's call, so these only show it.
 */

type Flags = { prepToday: boolean; latePrep: boolean; missedPickup: boolean; overdue: boolean }

/** One label per flag, for the badges and the notes beside items alike. */
const FLAG_LABELS = {
	prepToday: 'Připravit dnes',
	latePrep: 'Nepřipraveno',
	missedPickup: 'Nevyzvednuto',
	overdue: 'Po termínu',
} as const

export const PrepTodayBadge = () => <Badge variant="info">{FLAG_LABELS.prepToday}</Badge>
export const LatePrepBadge = () => <Badge variant="warning">{FLAG_LABELS.latePrep}</Badge>
export const MissedPickupBadge = () => <Badge variant="warning">{FLAG_LABELS.missedPickup}</Badge>
export const OverdueBadge = () => <Badge variant="warning">{FLAG_LABELS.overdue}</Badge>

/** Every flag a reservation or person carries — a family can be a Missed
 * pickup and Overdue at once. */
export const FlagBadges = ({ flags }: { flags: Flags }) => (
	<>
		{flags.prepToday && <PrepTodayBadge />}
		{flags.latePrep && <LatePrepBadge />}
		{flags.missedPickup && <MissedPickupBadge />}
		{flags.overdue && <OverdueBadge />}
	</>
)

/** Whether an item is behind — should have been prepared, collected or
 * brought back already — so its label should stand out. Prep today is still
 * on time. */
export const isItemBehind = (item: Flags) => item.latePrep || item.missedPickup || item.overdue

/** The note beside an item. Its status allows it only one flag at a time. */
export const ItemFlagNote = ({ item }: { item: Flags }) => {
	if (item.prepToday) return <span className="text-primary text-xs">{FLAG_LABELS.prepToday}</span>
	if (item.latePrep) return <ItemBehindNote label={FLAG_LABELS.latePrep} />
	if (item.missedPickup) return <ItemBehindNote label={FLAG_LABELS.missedPickup} />
	if (item.overdue) return <ItemBehindNote label={FLAG_LABELS.overdue} />
	return null
}

const ItemBehindNote = ({ label }: { label: string }) => (
	<span className="text-destructive text-xs">{label}</span>
)
