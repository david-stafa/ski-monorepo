import { Button } from '@ski-blazek/ui/components/button'
import { Calendar } from '@ski-blazek/ui/components/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@ski-blazek/ui/components/popover'
import { cn } from '@ski-blazek/ui/lib/utils'
import { parseISO } from 'date-fns'
import { CalendarIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { formatDate, toDateString } from '~/lib/format'

type DateFilterProps = {
	id?: string
	/** `yyyy-MM-dd`, or undefined for no filter. */
	value: string | undefined
	onValueChange: (value: string | undefined) => void
	className?: string
}

/**
 * One optional date, styled to sit in a row with the small select triggers.
 * The cross that clears it is a sibling laid over the trigger's right end,
 * not a child — a button can't hold another button.
 */
export const DateFilter = ({ id, value, onValueChange, className }: DateFilterProps) => {
	const [open, setOpen] = useState(false)
	const selected = value ? parseISO(value) : undefined

	return (
		<div className={cn('relative', className)}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					id={id}
					className={cn(
						'flex h-8 w-full items-center justify-between gap-1.5 rounded-3xl bg-input/50 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
						!selected && 'text-muted-foreground'
					)}
				>
					{selected ? formatDate(selected) : 'Libovolné'}
					{!selected && <CalendarIcon className="size-4" />}
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="end">
					<Calendar
						mode="single"
						selected={selected}
						onSelect={(date) => {
							onValueChange(date ? toDateString(date) : undefined)
							setOpen(false)
						}}
						defaultMonth={selected}
						showOutsideDays={false}
						autoFocus
					/>
				</PopoverContent>
			</Popover>
			{selected && (
				<Button
					variant="ghost"
					size="icon-xs"
					aria-label="Zrušit datum"
					className="absolute top-1/2 right-1.5 -translate-y-1/2"
					onClick={() => onValueChange(undefined)}
				>
					<XIcon />
				</Button>
			)}
		</div>
	)
}
