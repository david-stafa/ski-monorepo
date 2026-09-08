import { type GetReservationsInput, getReservationsInputSchema } from '@ski-blazek/api/schemas'
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
import { PlusIcon } from 'lucide-react'
import { ButtonLink } from '~/components/ui/button-link'
import { CustomItemPerPageSelect, CustomPagination } from '~/components/ui/CustomPagination'
import { ResetFiltersButton } from '~/components/ui/ResetFiltersButton'
import { SearchField } from '~/components/ui/SearchField'
import { ReservationListRow } from '~/domains/reservation/components/ReservationListRow'
import { ReservationStatusFilter } from '~/domains/reservation/components/ReservationStatusFilter'
import { useFilters } from '~/hooks/useFilter'
import { trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/reservation/')({
	validateSearch: getReservationsInputSchema,
	loaderDeps: ({ search: { page, itemsPerPage, orderBy, orderDirection, search, status } }) => ({
		page,
		itemsPerPage,
		orderBy,
		orderDirection,
		search,
		status,
	}),
	loader: async ({ context, deps }) => {
		return context.queryClient.ensureQueryData(context.trpc.reservation.list.queryOptions(deps))
	},
	component: RouteComponent,
})

function RouteComponent() {
	const {
		filters: { page, itemsPerPage, orderBy, orderDirection, search, status },
		setFilters,
		resetFilters,
	} = useFilters(Route.id)

	const handleFilterClick = (nextOrderBy: GetReservationsInput['orderBy']) => {
		setFilters({
			orderBy: nextOrderBy,
			orderDirection: nextOrderBy === orderBy && orderDirection === 'asc' ? 'desc' : 'asc',
			page: 1,
		})
	}

	/*  Get reservations query  */
	const { data } = useSuspenseQuery(
		trpc.reservation.list.queryOptions({
			page,
			itemsPerPage,
			orderBy,
			orderDirection,
			search,
			status,
		})
	)

	return (
		<div>
			{/*  TODO: stats  */}
			<section className="flex justify-between items-center mb-6">
				{/*  Title with total count  */}
				<TypographyH1 className="mb-6">
					Rezervace
					<span className="ml-1 align-super text-sm text-gray-500">({data.totalCount})</span>
				</TypographyH1>

				<ButtonLink to="/reservation/create" size="sm">
					<PlusIcon className="size-4" />
					Vytvořit rezervaci
				</ButtonLink>
			</section>

			{/*  Create reservation, filters and reset  */}
			<div className="mb-4 flex items-center justify-between gap-2">
				<div></div>
				<SearchField
					searchValue={search}
					placeholder="Hledat jméno nebo telefon..."
					onSearch={(search) => setFilters({ search, page: 1 })}
				/>

				<div className="flex items-center gap-2">
					<ResetFiltersButton
						resetFilters={resetFilters}
						defaultSearch={getReservationsInputSchema.parse({})}
						currentSearch={{
							page,
							itemsPerPage,
							orderBy,
							orderDirection,
							search,
							status,
						}}
					/>

					<ReservationStatusFilter
						status={status}
						onStatusChange={(status) => setFilters({ status, page: 1 })}
					/>
				</div>
			</div>

			{/*  Table  */}
			<Table className="mb-2 md:mb-4">
				<TableHeader>
					<TableRow>
						<TableHead>Akce</TableHead>
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
								Žádné rezervace nebyly nalezeny.
							</TableCell>
						</TableRow>
					) : (
						data.reservations.map((item) => <ReservationListRow reservation={item} key={item.id} />)
					)}
				</TableBody>
			</Table>

			<div className="flex items-center justify-between ">
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
