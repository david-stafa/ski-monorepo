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
import { useState } from 'react'
import { CustomItemPerPageSelect, CustomPagination } from '~/components/ui/CustomPagination'
import { ReservationListToolbar } from '~/domains/reservation/components/ReservationListToolbar'
import { ReservationRow } from '~/domains/reservation/components/ReservationRow'
import { ReservationStepDrawer } from '~/domains/reservation/components/ReservationStepDrawer'
import { SHEET_STEPS } from '~/domains/reservation/helpers/sheetSteps'
import { pickUpSearchSchema, toListInput } from '~/domains/reservation/pickUpSearch'
import { useFilters } from '~/hooks/useFilter'
import { trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/reservation/pick-up')({
	validateSearch: pickUpSearchSchema,
	loaderDeps: ({ search }) => toListInput(search),
	loader: async ({ context, deps }) =>
		context.queryClient.ensureQueryData(context.trpc.reservation.list.queryOptions(deps)),
	component: RouteComponent,
})

function RouteComponent() {
	const { filters, setFilters, resetFilters } = useFilters(Route.id)
	const [openId, setOpenId] = useState<string | null>(null)
	const { page, itemsPerPage, orderBy, orderDirection, search, kind, from, to } = filters

	const handleFilterClick = (nextOrderBy: GetReservationsInput['orderBy']) => {
		setFilters({
			orderBy: nextOrderBy,
			orderDirection: nextOrderBy === orderBy && orderDirection === 'asc' ? 'desc' : 'asc',
			page: 1,
		})
	}

	/*  Reservations starting inside the selected window, or flagged from before it  */
	const { data } = useSuspenseQuery(trpc.reservation.list.queryOptions(toListInput(filters)))

	return (
		// one gap spaces the whole page: the components themselves carry no margins
		<div className="flex flex-col gap-4">
			{/*  Title with total count  */}
			<TypographyH1>
				Výdej
				<span className="ml-1 align-super text-gray-500 text-sm">({data.totalCount})</span>
			</TypographyH1>

			<ReservationListToolbar
				from={from}
				to={to}
				onRangeChange={(range) => setFilters({ ...range, page: 1 })}
				search={search}
				onSearch={(search) => setFilters({ search, page: 1 })}
				kind={kind}
				onKindChange={(kind) => setFilters({ kind, page: 1 })}
				resetFilters={resetFilters}
				defaultSearch={pickUpSearchSchema.parse({})}
				currentSearch={filters}
			/>

			{/*  Table — a row opens the gear that has to leave the rack in the drawer  */}
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
						<TableHead>Stav</TableHead>
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
						<TableHead>Telefon</TableHead>
						<TableHead>Osoby</TableHead>
						<TableHead>Vybavení</TableHead>
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
						data.reservations.map((item) => (
							<ReservationRow key={item.id} reservation={item} onOpen={() => setOpenId(item.id)} />
						))
					)}
				</TableBody>
			</Table>

			<ReservationStepDrawer
				reservationId={openId}
				step={SHEET_STEPS.pickUp}
				onClose={() => setOpenId(null)}
			/>

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
