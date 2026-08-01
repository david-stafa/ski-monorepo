import { Button } from '@ski-blazek/ui/components/button'
import { Calendar } from '@ski-blazek/ui/components/calendar'
import { Label } from '@ski-blazek/ui/components/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ski-blazek/ui/components/popover'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { FieldInfo } from './FieldInfo'
import { withFieldGroup } from './SharedFormFields'
import { formatDate } from '~/lib/format'
import { startOfDay, endOfDay } from 'date-fns'

/**
 * Renders one range calendar that drives two separate form fields. Map it onto
 * the form with `fields`, e.g.
 * `fields={{ startDate: 'startDate', endDate: 'endDate' }}`.
 */
export const DateRangeField = withFieldGroup({
  defaultValues: { startDate: new Date(), endDate: new Date() },
  props: { label: '' },
  render: function DateRangeFieldGroup({ group, label }) {
    const [open, setOpen] = useState(false)

    return (
      <group.Field name="startDate">
        {(startField) => (
          <group.Field name="endDate">
            {(endField) => {
              const from = startField.state.value
              const to = endField.state.value

              return (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={startField.name}>{label}</Label>
                  <Popover
                    open={open}
                    onOpenChange={(nextOpen) => {
                      setOpen(nextOpen)
                      // the trigger keeps focus while the popover is open, so
                      // mark both fields touched on close instead of onBlur
                      if (!nextOpen) {
                        startField.handleBlur()
                        endField.handleBlur()
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        id={startField.name}
                        className="w-fit justify-start px-2.5 font-normal"
                      >
                        <CalendarIcon />
                        {formatDate(from)} – {formatDate(to)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        required
                        defaultMonth={from}
                        selected={{ from, to }}
                        onSelect={(range) => {
                          const nextFrom = range.from ?? from

                          startField.handleChange(startOfDay(nextFrom))
                          endField.handleChange(endOfDay(range.to ?? nextFrom))
                        }}
                        numberOfMonths={2}
                        showOutsideDays={false}
                        disabled={{ before: new Date() }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {/* one control, so at most one message: the range-order
                      refine is pathed to endDate, but a startDate error would
                      otherwise have nowhere to show */}
                  <FieldInfo
                    field={
                      startField.state.meta.errors.length
                        ? startField
                        : endField
                    }
                  />
                </div>
              )
            }}
          </group.Field>
        )}
      </group.Field>
    )
  },
})
