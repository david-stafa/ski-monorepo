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
import { TypographyH1 } from '@ski-blazek/ui/components/typography'
import { cn } from '@ski-blazek/ui/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { CustomItemPerPageSelect, CustomPagination } from '~/components/ui/CustomPagination'
import { ResetFiltersButton } from '~/components/ui/ResetFiltersButton'
import { SearchField } from '~/components/ui/SearchField'
import { CheckedFilterSelect } from '~/domains/equipment/_shared/components/CheckedFilterSelect'
import { InventoryToggleButton } from '~/domains/equipment/_shared/components/InventoryToggleButton'
import { StockCheckCheckbox } from '~/domains/equipment/_shared/components/StockCheckCheckbox'
import { StockSweepButton } from '~/domains/equipment/_shared/components/StockSweepButton'
import { formatArticleNumber } from '~/domains/equipment/_shared/helpers/formatArticleNumber'
import { genderLabel } from '~/domains/equipment/_shared/helpers/genderOptions'
import { AddSnowboardButton } from '~/domains/equipment/snowboard/components/AddSnowboardButton'
import { SnowboardActions } from '~/domains/equipment/snowboard/components/SnowboardActions'
import { useFilters } from '~/hooks/useFilter'
import { trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/equipment/snowboard')({
	// `inventory` is client-only — it toggles the stock-check UI and is
	// deliberately left out of `loaderDeps`, so it never reaches the API.
	validateSearch: getSnowboardInputSchema.extend({ inventory: z.boolean().optional() }),
	loaderDeps: ({
		search: { page, itemsPerPage, orderBy, orderDirection, search, checkedFilter },
	}) => ({
		page,
		itemsPerPage,
		orderBy,
		orderDirection,
		search,
		checkedFilter,
	}),
	loader: async ({ context, deps }) => {
		return context.queryClient.ensureQueryData(
			context.trpc.equipment.snowboard.list.queryOptions(deps)
		)
	},
	component: RouteComponent,
})

function RouteComponent() {
	const {
		filters: { page, itemsPerPage, orderBy, orderDirection, search, checkedFilter, inventory },
		setFilters,
		resetFilters,
	} = useFilters(Route.id)

	const isInventory = Boolean(inventory)
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
		})
	)

	return (
		<div>
			{/*  Title  with total count */}
			<div className="mb-6 flex justify-between gap-2">
				<TypographyH1>
					Snowboardy
					<span className="ml-1 align-super text-sm text-gray-500">({data.totalCount})</span>
				</TypographyH1>
				<div>
					{isInventory && <StockSweepButton type={EquipmentItemType.SNOWBOARD} />}
					<InventoryToggleButton
						inventory={isInventory}
						onToggle={(next) =>
							setFilters({
								inventory: next || undefined,
								checkedFilter: 'all',
								page: 1,
							})
						}
					/>
				</div>
			</div>

			{/*  Add snowboard and reset filters button  */}
			<div className="mb-4 flex items-center justify-between gap-2">
				<AddSnowboardButton />

				<SearchField searchValue={search} onSearch={(search) => setFilters({ search, page: 1 })} />

				{isInventory && (
					<CheckedFilterSelect
						value={checkedFilter}
						onValueChange={(value) => setFilters({ checkedFilter: value, page: 1 })}
					/>
				)}

				<ResetFiltersButton
					/*  In inventory mode reset the filters through `setFilters`, which
					    merges into the current search — inventura is a mode, not a
					    filter, and resetting shouldn't drop you out of it.  */
					resetFilters={
						isInventory ? () => setFilters({ ...defaultSearch, search: undefined }) : resetFilters
					}
					defaultSearch={defaultSearch}
					currentSearch={{
						page,
						itemsPerPage,
						orderBy,
						orderDirection,
						search,
						checkedFilter,
					}}
				/>
			</div>

			{/*  Table  */}
			<Table>
				<TableHeader>
					<TableRow>
						{isInventory && (
							<TableHeadSortable
								sorted={orderBy === 'lastCheckedAt' ? orderDirection : false}
								onClick={() => handleFilterClick('lastCheckedAt')}
								className="max-w-5"
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
								className={cn(
									isInventory &&
										isChecked(item.equipmentItem.lastCheckedAt) &&
										'bg-success/10 hover:bg-success/15'
								)}
							>
								{isInventory && (
									<TableCell>
										<StockCheckCheckbox
											equipmentItemId={item.equipmentItemId}
											lastCheckedAt={item.equipmentItem.lastCheckedAt}
											type={EquipmentItemType.SNOWBOARD}
										/>
									</TableCell>
								)}
								<TableCell className="flex items-center gap-2">
									<SnowboardActions defaultValues={item} />
								</TableCell>
								<TableCell>{formatArticleNumber(item.equipmentItem)}</TableCell>
								<TableCell>{item.brand}</TableCell>
								<TableCell>{item.model ? item.model : '—'}</TableCell>
								<TableCell>{item.length}</TableCell>
								<TableCell>{genderLabel(item.gender)}</TableCell>
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
