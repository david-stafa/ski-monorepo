import type { ReservationKindFilter } from '@ski-blazek/api/schemas'
import { Separator } from '@ski-blazek/ui/components/separator'
import { DateRangeFilter } from '~/components/ui/DateRangeFilter'
import { ResetFiltersButton } from '~/components/ui/ResetFiltersButton'
import { SearchField } from '~/components/ui/SearchField'
import type { DateRangeStrings } from '~/lib/dateRange'
import { ReservationFilters } from './ReservationFilters'

type ReservationListToolbarProps = {
	from: string
	to: string
	onRangeChange: (range: DateRangeStrings) => void
	search?: string
	onSearch: (search: string) => void
	kind: ReservationKindFilter
	onKindChange: (kind: ReservationKindFilter) => void
	resetFilters: () => void
	defaultSearch: object
	currentSearch: object
}

/** The toolbar of the counter pages (prep, pick-up, return): date window,
 * search, reset and filters. Stacked on small screens, one row from xl up. */
export const ReservationListToolbar = ({
	from,
	to,
	onRangeChange,
	search,
	onSearch,
	kind,
	onKindChange,
	resetFilters,
	defaultSearch,
	currentSearch,
}: ReservationListToolbarProps) => (
	<div className="flex flex-col justify-between gap-4 xl:flex-row">
		<DateRangeFilter from={from} to={to} onRangeChange={onRangeChange} className="xl:order-2" />

		{/*  Search, reset and filters  */}
		<div className="flex flex-1 gap-2">
			<SearchField
				searchValue={search}
				placeholder="Hledat jméno nebo telefon..."
				onSearch={onSearch}
				className="flex-1 xl:max-w-2xs"
			/>

			<div className="flex h-fit gap-1">
				<Separator orientation="vertical" className="my-auto mr-1 h-10" />
				<ResetFiltersButton
					resetFilters={resetFilters}
					defaultSearch={defaultSearch}
					currentSearch={currentSearch}
				/>

				<ReservationFilters kind={kind} onKindChange={onKindChange} />
			</div>
		</div>
	</div>
)
