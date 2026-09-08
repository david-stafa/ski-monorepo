import { Button } from '@ski-blazek/ui/components/button'
import { useIsMobile } from '@ski-blazek/ui/hooks/use-mobile'
import { cn } from '@ski-blazek/ui/lib/utils'
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
	const isMobile = useIsMobile()

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={resetFilters}
			disabled={isDefault}
			className={cn(isMobile && isDefault && 'hidden')}
		>
			<RefreshCcwIcon className="size-4" />
			Resetovat filtry
		</Button>
	)
}
