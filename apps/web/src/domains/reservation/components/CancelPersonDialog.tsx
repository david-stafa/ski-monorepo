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
import { BanIcon, TriangleAlertIcon } from 'lucide-react'
import { useCancelPerson } from '../reservationQueries'

type CancelPersonDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	person: { id: string; name: string }
}

export const CancelPersonDialog = ({ open, onOpenChange, person }: CancelPersonDialogProps) => {
	const cancelPerson = useCancelPerson()

	const handleCancel = () => {
		cancelPerson.mutate({ id: person.id })
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TriangleAlertIcon className="text-destructive size-5" />
						Opravdu chcete zrušit osobu {person.name}?
					</DialogTitle>
					<DialogDescription>
						Zrušením se uvolní vybavení této osoby. Ostatní osoby na rezervaci zůstanou. Tato akce
						je nevratná.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>Zpět</DialogClose>
					<Button variant="destructive" onClick={handleCancel}>
						<BanIcon className="size-4" />
						Zrušit osobu
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
