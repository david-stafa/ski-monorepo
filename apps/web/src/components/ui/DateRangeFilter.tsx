import { Calendar, type DateRange } from '@ski-blazek/ui/components/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@ski-blazek/ui/components/popover'
import { ToggleGroup, ToggleGroupItem } from '@ski-blazek/ui/components/toggle-group'
import { cn } from '@ski-blazek/ui/lib/utils'
import { parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { type DateRangeStrings, getTodayRange, getWeekRange } from '~/lib/dateRange'
import { formatDate, toDateString } from '~/lib/format'

const presets = [
	{ value: 'today', label: 'Dnes', getRange: getTodayRange },
	{ value: 'thisWeek', label: 'Tento týden', getRange: () => getWeekRange(0) },
	{ value: 'nextWeek', label: 'Příští týden', getRange: () => getWeekRange(1) },
]

const CUSTOM = 'custom'

type DateRangeFilterProps = {
	from: string
	to: string
	onRangeChange: (range: DateRangeStrings) => void
	className?: string
}

export const DateRangeFilter = ({ from, to, onRangeChange, className }: DateRangeFilterProps) => {
	const [open, setOpen] = useState(false)
	// Picking a range takes two clicks. The half-picked state is held here
	// rather than pushed to the URL, so the list never refetches against a
	// window with only one end.
	const [draft, setDraft] = useState<DateRange | undefined>(undefined)

	const selected = draft ?? { from: parseISO(from), to: parseISO(to) }

	// Which item is pressed is read off the URL range, never stored: a range
	// that matches no preset is a custom one, picked in the calendar.
	const activePreset = presets.find((preset) => {
		const range = preset.getRange()
		return range.from === from && range.to === to
	})
	const pressed = activePreset?.value ?? CUSTOM

	const commit = (range: DateRangeStrings) => {
		setDraft(undefined)
		onRangeChange(range)
	}

	const handlePresetChange = (groupValue: string[]) => {
		// Empty when the pressed item is clicked again, and the calendar item
		// only opens the popover — neither changes the range.
		const preset = presets.find((p) => p.value === groupValue[0])
		if (preset) commit(preset.getRange())
	}

	const handleSelect = (range: DateRange | undefined) => {
		if (!range?.from || !range.to) {
			setDraft(range)
			return
		}

		commit({ from: toDateString(range.from), to: toDateString(range.to) })
	}

	return (
		<div className={cn('flex flex-col gap-2 xl:flex-row xl:items-center', className)}>
			{/* h-10 like the search field and buttons next to it: 32px items + p-1 */}
			<ToggleGroup
				size="sm"
				spacing={1}
				value={[pressed]}
				onValueChange={handlePresetChange}
				className="h-10 w-full rounded-full bg-input/50 p-1 xl:order-2"
			>
				{presets.map((preset) => (
					<ToggleGroupItem
						key={preset.value}
						value={preset.value}
						className="flex-auto aria-pressed:bg-primary aria-pressed:text-primary-foreground"
					>
						{preset.label}
					</ToggleGroupItem>
				))}

				<Popover
					open={open}
					onOpenChange={(nextOpen) => {
						// Abandoning a half-picked range leaves the committed one in place.
						if (!nextOpen) setDraft(undefined)
						setOpen(nextOpen)
					}}
				>
					<PopoverTrigger
						render={
							<ToggleGroupItem
								value={CUSTOM}
								aria-label="Vlastní období"
								className="w-10 flex-auto aria-pressed:bg-primary aria-pressed:text-primary-foreground"
							/>
						}
					>
						<CalendarIcon className="size-4" />
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="range"
							selected={selected}
							onSelect={handleSelect}
							defaultMonth={parseISO(from)}
							numberOfMonths={2}
							showOutsideDays={false}
							autoFocus
						/>
					</PopoverContent>
				</Popover>
			</ToggleGroup>

			{pressed === CUSTOM && (
				<p className="ml-1 w-full text-muted-foreground text-sm">
					{formatDate(parseISO(from))} – {formatDate(parseISO(to))}
				</p>
			)}
		</div>
	)
}
