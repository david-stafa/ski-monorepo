import { Button } from '@ski-blazek/ui/components/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@ski-blazek/ui/components/dialog'
import { useIsMobile } from '@ski-blazek/ui/hooks/use-mobile'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { HelmetForm } from './HelmetForm'

export const AddHelmetButton = () => {
	const [open, setOpen] = useState(false)
	const isMobile = useIsMobile()

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={<Button size={isMobile ? 'icon-lg' : 'lg'} aria-label="Přidat helmu" />}
			>
				<PlusIcon />
				{!isMobile && 'Přidat helmu'}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Přidat helmu</DialogTitle>
				</DialogHeader>
				<HelmetForm close={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	)
}
