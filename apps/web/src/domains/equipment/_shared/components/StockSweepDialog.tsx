import type { EquipmentItemType } from '@ski-blazek/db/browser'
import { Button } from '@ski-blazek/ui/components/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@ski-blazek/ui/components/dialog'
import { useQuery } from '@tanstack/react-query'
import { ArchiveIcon, TriangleAlertIcon } from 'lucide-react'
import { formatArticleNumber } from '~/domains/equipment/_shared/helpers/formatArticleNumber'
import { trpc } from '~/lib/trpc'
import { useArchiveUnchecked } from '../queries/equipmentQueries'

type StockSweepDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	type: EquipmentItemType
}

/**
 * The end of an inventura: everything of this type that never turned up gets
 * archived in one go.
 *
 * It previews first and it archives rather than deletes. Deleting refuses any
 * item with booking history — after a season that is most of the stock — while
 * archiving keeps the history, takes the item out of availability, and releases
 * its article number for the next one.
 */
export const StockSweepDialog = ({ open, onOpenChange, type }: StockSweepDialogProps) => {
	const archiveUnchecked = useArchiveUnchecked(type)

	const { data: items = [], isPending } = useQuery({
		...trpc.equipment.equipmentItem.previewStockSweep.queryOptions({ type }),
		enabled: open,
	})

	const handleArchive = () => {
		archiveUnchecked.mutate({ type })
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TriangleAlertIcon className="text-warning size-5" />
						Archivovat nezkontrolované ({items.length})
					</DialogTitle>
					<DialogDescription>
						Tyto kusy nebyly v letošní inventuře zkontrolovány. Archivací zůstanou zachovány
						historické rezervace a jejich čísla se uvolní pro nové vybavení.
					</DialogDescription>
				</DialogHeader>

				{isPending ? (
					<p className="text-muted-foreground text-sm">Načítání…</p>
				) : items.length === 0 ? (
					<p className="text-sm">Všechny kusy jsou zkontrolované — není co archivovat.</p>
				) : (
					<ul className="max-h-72 divide-y overflow-y-auto rounded-md border text-sm">
						{items.map((item) => (
							<li key={item.id} className="flex items-center gap-3 px-3 py-1.5">
								<span className="text-muted-foreground w-16 shrink-0 tabular-nums">
									{formatArticleNumber(item)}
								</span>
								<span>{item.label}</span>
							</li>
						))}
					</ul>
				)}

				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>Zrušit</DialogClose>
					<Button variant="warning" disabled={items.length === 0} onClick={handleArchive}>
						<ArchiveIcon className="size-4" />
						Archivovat {items.length}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
