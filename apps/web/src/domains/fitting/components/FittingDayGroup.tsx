import { TableCell, TableRow } from '@ski-blazek/ui/components/table'
import { format, parseISO } from 'date-fns'
import { cs } from 'date-fns/locale'
import type { Fitting } from '../fitting.types'

type FittingDayGroupProps = {
	date: string
	fittings: Fitting[]
}

export const FittingDayGroup = ({ date, fittings }: FittingDayGroupProps) => (
	<>
		<TableRow className="bg-muted/50 hover:bg-muted/50">
			<TableCell colSpan={4} className="font-medium">
				{/* the feed's `date` is already a Prague calendar date, so parse it as
				    plain local time rather than as an instant */}
				{format(parseISO(date), 'EEEE d. M.', { locale: cs })}
			</TableCell>
		</TableRow>

		{fittings.map((fitting) => (
			<TableRow key={fitting.id}>
				<TableCell className="tabular-nums whitespace-nowrap">
					{fitting.startTime}–{fitting.endTime}
				</TableCell>
				<TableCell>
					{fitting.firstName} {fitting.lastName}
				</TableCell>
				<TableCell className="tabular-nums">{fitting.peopleCount}</TableCell>
				<TableCell className="tabular-nums whitespace-nowrap">{fitting.phone}</TableCell>
			</TableRow>
		))}
	</>
)
