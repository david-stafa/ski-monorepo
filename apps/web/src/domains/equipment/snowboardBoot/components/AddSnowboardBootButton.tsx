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
import { SnowboardBootForm } from './SnowboardBootForm'

export const AddSnowboardBootButton = () => {
	const [open, setOpen] = useState(false)
	const isMobile = useIsMobile()

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={<Button size={isMobile ? 'icon-lg' : 'lg'} aria-label="Přidat boty" />}
			>
				<PlusIcon />
				{!isMobile && 'Přidat boty'}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Přidat snowboardovou botu</DialogTitle>
				</DialogHeader>
				<SnowboardBootForm close={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	)
}
