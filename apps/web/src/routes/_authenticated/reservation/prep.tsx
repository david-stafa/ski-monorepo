import type { GetReservationsInput } from '@ski-blazek/api/schemas'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableHeadSortable,
	TableRow,
} from '@ski-blazek/ui/components/table'
import { TypographyH1 } from '@ski-blazek/ui/components/typography'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CustomItemPerPageSelect, CustomPagination } from '~/components/ui/CustomPagination'
import { DateRangeFilter } from '~/components/ui/DateRangeFilter'
import { ResetFiltersButton } from '~/components/ui/ResetFiltersButton'
import { SearchField } from '~/components/ui/SearchField'
import { ReservationRow } from '~/domains/reservation/components/ReservationRow'
import { prepSearchSchema, toListInput } from '~/domains/reservation/prepSearch'
import { useFilters } from '~/hooks/useFilter'
import { trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/reservation/prep')({
	validateSearch: prepSearchSchema,
	loaderDeps: ({ search }) => toListInput(search),
	loader: async ({ context, deps }) =>
		context.queryClient.ensureQueryData(context.trpc.reservation.list.queryOptions(deps)),
	component: RouteComponent,
})

function RouteComponent() {
	const { filters, setFilters, resetFilters } = useFilters(Route.id)
	const { page, itemsPerPage, orderBy, orderDirection, search, from, to } = filters

	const handleFilterClick = (nextOrderBy: GetReservationsInput['orderBy']) => {
		setFilters({
			orderBy: nextOrderBy,
			orderDirection: nextOrderBy === orderBy && orderDirection === 'asc' ? 'desc' : 'asc',
			page: 1,
		})
	}
	/*  Reservations starting inside the selected window  */
	const { data } = useSuspenseQuery(trpc.reservation.list.queryOptions(toListInput(filters)))
	return (
		<div>
			{/*  Title with total count  */}
			<TypographyH1 className="mb-6">
				Příprava
				<span className="ml-1 align-super text-sm text-gray-500">({data.totalCount})</span>
			</TypographyH1>

			{/*  Date window, filters and reset  */}
			<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
				<DateRangeFilter
					from={from}
					to={to}
					onRangeChange={(range) => setFilters({ ...range, page: 1 })}
				/>

				<SearchField
					searchValue={search}
					placeholder="Hledat jméno nebo telefon..."
					onSearch={(search) => setFilters({ search, page: 1 })}
				/>

				<div className="flex items-center gap-2">
					<ResetFiltersButton
						resetFilters={resetFilters}
						defaultSearch={prepSearchSchema.parse({})}
						currentSearch={filters}
					/>
				</div>
			</div>

			{/*  Table — each row expands to the gear that has to leave the rack  */}
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-10" />
						<TableHeadSortable
							sorted={orderBy === 'name' ? orderDirection : false}
							onClick={() => handleFilterClick('name')}
						>
							Jméno
						</TableHeadSortable>
						<TableHead>Telefon</TableHead>
						<TableHeadSortable
							sorted={orderBy === 'startDate' ? orderDirection : false}
							onClick={() => handleFilterClick('startDate')}
						>
							Od
						</TableHeadSortable>
						<TableHeadSortable
							sorted={orderBy === 'endDate' ? orderDirection : false}
							onClick={() => handleFilterClick('endDate')}
						>
							Do
						</TableHeadSortable>
						<TableHead>Osoby</TableHead>
						<TableHead>Vybavení</TableHead>
						<TableHead>Stav</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.reservations.length === 0 ? (
						<TableRow>
							<TableCell colSpan={8} className="h-50 text-center">
								V tomto období nikdo nevyzvedává vybavení.
							</TableCell>
						</TableRow>
					) : (
						data.reservations.map((item) => <ReservationRow key={item.id} reservation={item} />)
					)}
				</TableBody>
			</Table>

			<div className="flex items-center justify-between">
				{/*  Pagination  */}
				<CustomPagination
					currentPage={page}
					itemsCount={data.totalCount}
					itemsPerPage={itemsPerPage}
				/>
				{/*  Item per page select  */}
				<CustomItemPerPageSelect
					itemsPerPage={itemsPerPage}
					onValueChange={(value) => {
						setFilters({
							itemsPerPage: Number(value),
							page: 1,
						})
					}}
				/>
			</div>
		</div>
	)
}
