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
import { TrashIcon, TriangleAlertIcon } from 'lucide-react'

type RemovePersonDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	name: string
	// a saved person is cancelled on submit; a new one was never stored
	isSaved: boolean
	onRemove: () => void
}

export const RemovePersonDialog = ({
	open,
	onOpenChange,
	name,
	isSaved,
	onRemove,
}: RemovePersonDialogProps) => {
	const handleRemove = () => {
		onRemove()
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TriangleAlertIcon className="text-destructive size-5" />
						Opravdu chcete odebrat osobu {name}?
					</DialogTitle>
					<DialogDescription>
						{isSaved
							? 'Po uložení rezervace bude osoba zrušena a její vybavení se uvolní. Tato akce je nevratná.'
							: 'Osoba a vyplněné údaje budou z formuláře odebrány.'}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>Zpět</DialogClose>
					<Button variant="destructive" onClick={handleRemove}>
						<TrashIcon className="size-4" />
						Smazat osobu
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
