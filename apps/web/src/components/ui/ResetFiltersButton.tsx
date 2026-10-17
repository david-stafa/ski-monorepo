import { Button } from '@ski-blazek/ui/components/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ski-blazek/ui/components/tooltip'
import { RefreshCcwIcon } from 'lucide-react'
import { areObjectsEqual } from '~/lib/utils'

type ResetFiltersButtonProps = {
	resetFilters: () => void
	defaultSearch: object
	currentSearch: object
}

export const ResetFiltersButton = ({
	resetFilters,
	defaultSearch,
	currentSearch,
}: ResetFiltersButtonProps) => {
	const isDefault = areObjectsEqual(defaultSearch, currentSearch)

	if (isDefault) return

	return (
		<Tooltip>
			<TooltipTrigger
				// 40px square like the rest of the toolbar; the tooltip carries the label
				render={
					<Button
						variant="outline"
						size="icon-lg"
						aria-label="Resetovat filtry"
						onClick={resetFilters}
					/>
				}
			>
				<RefreshCcwIcon className="size-4" />
			</TooltipTrigger>
			<TooltipContent>Resetovat filtry</TooltipContent>
		</Tooltip>
	)
}
