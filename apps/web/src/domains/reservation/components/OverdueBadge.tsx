import { Badge } from '@ski-blazek/ui/components/badge'

/** Gear still out after the end date (see Overdue in CONTEXT.md). Whether it
 * is overdue is the API's call, so this only shows it. */
export const OverdueBadge = () => <Badge variant="warning">Po termínu</Badge>
