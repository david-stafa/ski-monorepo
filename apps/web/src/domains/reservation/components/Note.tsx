import { cn } from '@ski-blazek/ui/lib/utils'
import { MessageCircleIcon } from 'lucide-react'

/** A reservation's or a person's note: the speech bubble marks it, no label. */
export const Note = ({ note, className }: { note: string; className?: string }) => (
	<div className={cn('flex items-start gap-2 text-sm', className)}>
		<MessageCircleIcon size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
		<p>{note}</p>
	</div>
)
