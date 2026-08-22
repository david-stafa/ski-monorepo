import { Button } from '@ski-blazek/ui/components/button'
import { Calendar, type DateRange } from '@ski-blazek/ui/components/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ski-blazek/ui/components/popover'
import { parseISO } from 'date-fns'
import { CalendarIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import {
  getTodayRange,
  getWeekRange,
  type DateRangeStrings,
} from '~/lib/dateRange'
import { formatDate, toDateString } from '~/lib/format'

const presets = [
  { label: 'Dnes', getRange: getTodayRange },
  { label: 'Tento týden', getRange: () => getWeekRange(0) },
  { label: 'Příští týden', getRange: () => getWeekRange(1) },
]

type DateRangeFieldProps = {
  from: string
  to: string
  onRangeChange: (range: DateRangeStrings) => void
}

export const DateRangeField = ({
  from,
  to,
  onRangeChange,
}: DateRangeFieldProps) => {
  const [open, setOpen] = useState(false)
  // Picking a range takes two clicks. The half-picked state is held here
  // rather than pushed to the URL, so the list never refetches against a
  // window with only one end.
  const [draft, setDraft] = useState<DateRange | undefined>(undefined)

  const selected = draft ?? { from: parseISO(from), to: parseISO(to) }

  const commit = (range: DateRangeStrings) => {
    setDraft(undefined)
    onRangeChange(range)
  }

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from || !range.to) {
      setDraft(range)
      return
    }

    commit({ from: toDateString(range.from), to: toDateString(range.to) })
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        // Abandoning a half-picked range leaves the committed one in place.
        if (!nextOpen) setDraft(undefined)
        setOpen(nextOpen)
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarIcon className="size-4" />
          {formatDate(parseISO(from))} – {formatDate(parseISO(to))}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex justify-between gap-1 border-b p-2">
          <div className="flex gap-1">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="default"
                size="xs"
                onClick={() => commit(preset.getRange())}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Button
            size="icon-xs"
            variant={'outline'}
            onClick={() => setOpen(false)}
          >
            <XIcon />
          </Button>
        </div>
        <Calendar
          mode="range"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={parseISO(from)}
          numberOfMonths={2}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
