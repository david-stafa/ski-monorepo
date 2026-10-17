import type { ArchivedFilter, CheckedFilter, PaginationInput } from '@ski-blazek/api/schemas'
import type { EquipmentItemType } from '@ski-blazek/db/browser'
import { TypographyH1 } from '@ski-blazek/ui/components/typography'
import type { ReactNode } from 'react'
import { ResetFiltersButton } from '~/components/ui/ResetFiltersButton'
import { SearchField } from '~/components/ui/SearchField'
import { EquipmentDropdown } from './EquipmentDropdown'
import { EquipmentFilterButton } from './EquipmentFilterButton'

/*  The search params every equipment list page shares. `orderBy` is a
    different enum per type — the header only passes it through, so `string`.  */
type EquipmentListSearch = PaginationInput & {
	search?: string
	orderBy: string
	orderDirection: 'asc' | 'desc'
	checkedFilter: CheckedFilter
	archivedFilter: ArchivedFilter
}

type EquipmentHeaderProps = {
	label: string
	type: EquipmentItemType
	totalCount: number
	addButton: ReactNode
	filters: EquipmentListSearch & { inventory?: boolean }
	defaultSearch: EquipmentListSearch
	/*  Method syntax on purpose: it lets each page pass its own `setFilters`,
	    whose `orderBy` is narrower than the `string` above.  */
	setFilters(filters: Partial<EquipmentListSearch & { inventory?: boolean }>): void
	resetFilters: () => void
}

export const EquipmentHeader = ({
	label,
	type,
	totalCount,
	addButton,
	filters,
	defaultSearch,
	setFilters,
	resetFilters,
}: EquipmentHeaderProps) => {
	const { page, itemsPerPage, orderBy, orderDirection, search, checkedFilter, archivedFilter } =
		filters
	const isInventory = Boolean(filters.inventory)

	return (
		<>
			{/*  Title  with total count */}
			<div className="flex flex-wrap items-start justify-between gap-2">
				<TypographyH1>
					{label}
					<span className="ml-1 align-super text-gray-500 text-sm">({totalCount})</span>
				</TypographyH1>
				<div className="flex items-center gap-2">
					<EquipmentDropdown
						isInventory={isInventory}
						onInventoryToggle={(next) =>
							setFilters({
								inventory: next || undefined,
								checkedFilter: 'all',
								page: 1,
							})
						}
						type={type}
					/>
					{addButton}
				</div>
			</div>

			{/*  Add button, search and filters  */}
			<div className="flex items-center justify-between gap-2">
				<SearchField searchValue={search} onSearch={(search) => setFilters({ search, page: 1 })} />

				<div className="flex items-center gap-2">
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
							archivedFilter,
						}}
					/>

					<EquipmentFilterButton
						archivedFilter={archivedFilter}
						onArchivedFilterChange={(archivedFilter) => setFilters({ archivedFilter, page: 1 })}
						inventuraFilter={checkedFilter}
						onInventuraFilterChange={(checkedFilter) => setFilters({ checkedFilter, page: 1 })}
						isInventura={isInventory}
					/>
				</div>
			</div>
		</>
	)
}
