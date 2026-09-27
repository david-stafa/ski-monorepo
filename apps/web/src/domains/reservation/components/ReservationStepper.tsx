import { STATUS_STEPS } from '@ski-blazek/api/schemas'
import type { ReservationStatus } from '@ski-blazek/db/browser'
import { cn } from '@ski-blazek/ui/lib/utils'
import { CheckIcon } from 'lucide-react'
import { RESERVATION_STATUS_META } from '../helpers/reservationStatus'
import { type StepUnit, statusRank } from '../helpers/stepUnits'

type ReservationStepperProps = {
	/** Everything on the reservation that has a status of its own. */
	units: StepUnit[]
	/** The reservation's rolled-up status. */
	current: ReservationStatus
}

/**
 * Where the whole family is, at a glance: each step with how many of its
 * items (and accessories-only people) have reached it. Display only — a click
 * on "Vráceno" would be a frightening multi-step jump.
 */
export const ReservationStepper = ({ units, current }: ReservationStepperProps) => (
	<ol className="flex items-start">
		{STATUS_STEPS.map((step, index) => {
			const reached = units.filter((unit) => statusRank(unit.status) >= index).length
			const complete = units.length > 0 && reached === units.length
			const isCurrent = step === current
			return (
				<li key={step} className="flex flex-1 items-start last:flex-none">
					<div className="flex flex-col items-center gap-1 text-center">
						<span
							className={cn(
								'flex size-9 items-center justify-center rounded-full border-2 text-sm font-medium',
								complete && 'border-primary bg-primary text-primary-foreground',
								!complete && isCurrent && 'border-primary text-primary',
								!complete && !isCurrent && 'text-muted-foreground'
							)}
						>
							{complete ? <CheckIcon className="size-4" /> : index + 1}
						</span>
						<span className={cn('text-sm', isCurrent ? 'font-medium' : 'text-muted-foreground')}>
							{RESERVATION_STATUS_META[step].label}
						</span>
						<span className="text-muted-foreground text-xs tabular-nums">
							{reached}/{units.length}
						</span>
					</div>
					{index < STATUS_STEPS.length - 1 && (
						<span
							className={cn('mx-2 mt-[18px] h-0.5 flex-1', complete ? 'bg-primary' : 'bg-border')}
						/>
					)}
				</li>
			)
		})}
	</ol>
)
