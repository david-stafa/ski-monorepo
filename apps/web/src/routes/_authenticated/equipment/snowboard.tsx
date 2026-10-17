import { type GetSnowboardInput, getSnowboardInputSchema, isChecked } from '@ski-blazek/api/schemas'
import { EquipmentItemType } from '@ski-blazek/db/browser'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableHeadSortable,
	TableRow,
} from '@ski-blazek/ui/components/table'
import { cn } from '@ski-blazek/ui/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { CustomItemPerPageSelect, CustomPagination } from '~/components/ui/CustomPagination'
import { GenderBadge } from '~/domains/equipment/_shared/components/badges/GenderBadge'
import { EquipmentHeader } from '~/domains/equipment/_shared/components/EquipmentHeader'
import { StockCheckCheckbox } from '~/domains/equipment/_shared/components/StockCheckCheckbox'
import { formatArticleNumber } from '~/domains/equipment/_shared/helpers/formatArticleNumber'
import { AddSnowboardButton } from '~/domains/equipment/snowboard/components/AddSnowboardButton'
import { SnowboardActions } from '~/domains/equipment/snowboard/components/SnowboardActions'
import { useFilters } from '~/hooks/useFilter'
import { trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/equipment/snowboard')({
	// `inventory` is client-only — it toggles the stock-check UI and is
	// deliberately left out of `loaderDeps`, so it never reaches the API.
	validateSearch: getSnowboardInputSchema.extend({ inventory: z.boolean().optional() }),
	loaderDeps: ({
		search: { page, itemsPerPage, orderBy, orderDirection, search, checkedFilter, archivedFilter },
	}) => ({
		page,
		itemsPerPage,
		orderBy,
		orderDirection,
		search,
		checkedFilter,
		archivedFilter,
	}),
	loader: async ({ context, deps }) => {
		return context.queryClient.ensureQueryData(
			context.trpc.equipment.snowboard.list.queryOptions(deps)
		)
	},
	component: RouteComponent,
})

function RouteComponent() {
	const { filters, setFilters, resetFilters } = useFilters(Route.id)
	const { page, itemsPerPage, orderBy, orderDirection, search, checkedFilter, archivedFilter } =
		filters
	const navigate = useNavigate()

	const isInventory = Boolean(filters.inventory)
	const defaultSearch = getSnowboardInputSchema.parse({})

	const handleFilterClick = (nextOrderBy: GetSnowboardInput['orderBy']) => {
		setFilters({
			orderBy: nextOrderBy,
			orderDirection: nextOrderBy === orderBy && orderDirection === 'asc' ? 'desc' : 'asc',
			page: 1,
		})
	}

	/*  Get Snowboard Query   */
	const { data } = useSuspenseQuery(
		trpc.equipment.snowboard.list.queryOptions({
			page,
			itemsPerPage,
			orderBy,
			orderDirection,
			search,
			checkedFilter,
			archivedFilter,
		})
	)

	return (
		<div className="flex flex-col gap-4">
			<EquipmentHeader
				label="Snowboardy"
				type={EquipmentItemType.SNOWBOARD}
				totalCount={data.totalCount}
				addButton={<AddSnowboardButton />}
				filters={filters}
				defaultSearch={defaultSearch}
				setFilters={setFilters}
				resetFilters={resetFilters}
			/>

			{/*  Table  */}
			<Table>
				<TableHeader>
					<TableRow>
						{isInventory && (
							<TableHeadSortable
								sorted={orderBy === 'lastCheckedAt' ? orderDirection : false}
								onClick={() => handleFilterClick('lastCheckedAt')}
								className="w-28"
							>
								Inventura
							</TableHeadSortable>
						)}
						<TableHead>Akce</TableHead>
						<TableHeadSortable
							sorted={orderBy === 'articleNumber' ? orderDirection : false}
							onClick={() => handleFilterClick('articleNumber')}
						>
							Číslo
						</TableHeadSortable>
						<TableHeadSortable
							sorted={orderBy === 'brand' ? orderDirection : false}
							onClick={() => handleFilterClick('brand')}
						>
							Značka
						</TableHeadSortable>
						<TableHeadSortable
							sorted={orderBy === 'model' ? orderDirection : false}
							onClick={() => handleFilterClick('model')}
						>
							Model
						</TableHeadSortable>
						<TableHeadSortable
							sorted={orderBy === 'length' ? orderDirection : false}
							onClick={() => handleFilterClick('length')}
						>
							Délka
						</TableHeadSortable>
						<TableHeadSortable
							sorted={orderBy === 'gender' ? orderDirection : false}
							onClick={() => handleFilterClick('gender')}
						>
							Pohlaví
						</TableHeadSortable>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.snowboards.length === 0 ? (
						<TableRow>
							<TableCell colSpan={isInventory ? 7 : 6} className="h-50 text-center">
								Žádné snowboardy nebyly nalezeny.
							</TableCell>
						</TableRow>
					) : (
						data.snowboards.map((item) => (
							<TableRow
								key={item.id}
								onClick={() =>
									navigate({
										to: '/equipment/$equipmentId',
										params: { equipmentId: item.equipmentItemId },
									})
								}
								className={cn(
									'cursor-pointer',
									isInventory &&
										isChecked(item.equipmentItem.lastCheckedAt) &&
										'bg-success/10 hover:bg-success/15'
								)}
							>
								{isInventory && (
									// its own control, not a click on the row
									<TableCell onClick={(event) => event.stopPropagation()}>
										<StockCheckCheckbox
											equipmentItemId={item.equipmentItemId}
											lastCheckedAt={item.equipmentItem.lastCheckedAt}
											type={EquipmentItemType.SNOWBOARD}
										/>
									</TableCell>
								)}
								<TableCell
									className="flex items-center gap-2"
									// its menu and dialogs, not a click on the row
									onClick={(event) => event.stopPropagation()}
								>
									<SnowboardActions defaultValues={item} />
								</TableCell>
								<TableCell>{formatArticleNumber(item.equipmentItem)}</TableCell>
								<TableCell>{item.brand}</TableCell>
								<TableCell>{item.model ? item.model : '—'}</TableCell>
								<TableCell>{item.length}</TableCell>
								<TableCell>
									<GenderBadge gender={item.gender} />
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			<div className="flex items-center justify-between">
				{/*  Pagination   */}
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
