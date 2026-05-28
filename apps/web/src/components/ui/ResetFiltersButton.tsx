import { Button } from '@ski-blazek/ui/components/button'
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

  if (isDefault) {
    return null
  }

  return (
    <Button variant="outline" size="sm" onClick={resetFilters}>
      <RefreshCcwIcon className="size-4" />
      Resetovat filtry
    </Button>
  )
}
