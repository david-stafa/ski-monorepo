import { Button } from '@ski-blazek/ui/components/button'
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@ski-blazek/ui/components/card'
import { Skeleton } from '@ski-blazek/ui/components/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@ski-blazek/ui/components/table'
import { useQuery } from '@tanstack/react-query'
import { addWeeks, parseISO } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'
import { formatDate, toDateString } from '~/lib/format'
import { trpc } from '~/lib/trpc'
import type { Fitting } from '../fitting.types'
import { FittingDayGroup } from './FittingDayGroup'

const COLUMN_COUNT = 4

/** Named rather than index-keyed, so the loading rows need no array-index keys. */
const PLACEHOLDER_ROWS = ['first', 'second', 'third']

/** The feed returns the week already sorted by start time, so grouping in one
 * pass keeps the days in order without re-sorting. */
const groupByDate = (fittings: Fitting[]) => {
	const days = new Map<string, Fitting[]>()

	for (const fitting of fittings) {
		const day = days.get(fitting.date)
		if (day) {
			day.push(fitting)
		} else {
			days.set(fitting.date, [fitting])
		}
	}

	return [...days]
}

/**
 * Fitting appointments for one week, read from the ski-reservation app.
 *
 * Those are the slots where customers come in to get measured — separate from
 * this app's own reservations, which cover the rental itself.
 */
export const FittingWeekCard = () => {
	// `undefined` asks the feed for the current week, so the day it rolls over is
	// decided in the upstream app's timezone rather than in the browser's.
	const [week, setWeek] = useState<string | undefined>(undefined)

	const { data, isPending, isError, error } = useQuery(
		trpc.fitting.listWeekly.queryOptions({ week }, { staleTime: 60_000 })
	)

	// Until the first response lands there is no week to step from, so the
	// arrows anchor on today.
	const shiftWeek = (weeks: number) =>
		setWeek(toDateString(addWeeks(data ? parseISO(data.week.from) : new Date(), weeks)))

	return (
		<Card>
			<CardHeader>
				<CardTitle>Zkoušení</CardTitle>
				<CardDescription>
					{data
						? `${formatDate(parseISO(data.week.from))} – ${formatDate(parseISO(data.week.to))}`
						: 'Načítám týden…'}
				</CardDescription>

				<CardAction className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Předchozí týden"
						onClick={() => shiftWeek(-1)}
					>
						<ChevronLeftIcon className="size-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Další týden"
						onClick={() => shiftWeek(1)}
					>
						<ChevronRightIcon className="size-4" />
					</Button>
				</CardAction>
			</CardHeader>

			<CardContent>
				{isError ? (
					<p className="py-8 text-center text-sm text-muted-foreground">{error.message}</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Čas</TableHead>
								<TableHead>Jméno</TableHead>
								<TableHead>Osoby</TableHead>
								<TableHead>Telefon</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending ? (
								PLACEHOLDER_ROWS.map((row) => (
									<TableRow key={row}>
										<TableCell colSpan={COLUMN_COUNT}>
											<Skeleton className="h-5 w-full" />
										</TableCell>
									</TableRow>
								))
							) : data.reservations.length === 0 ? (
								<TableRow>
									<TableCell colSpan={COLUMN_COUNT} className="h-24 text-center">
										V tomto týdnu nikdo není objednaný.
									</TableCell>
								</TableRow>
							) : (
								groupByDate(data.reservations).map(([date, fittings]) => (
									<FittingDayGroup key={date} date={date} fittings={fittings} />
								))
							)}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	)
}
