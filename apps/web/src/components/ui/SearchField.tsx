import { Input } from '@ski-blazek/ui/components/input'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '~/hooks/useDebounce'

type SearchFieldProps = {
  placeholder?: string
  onSearch: (value: string) => void
  searchValue?: string
}

export const SearchField = ({
  placeholder = 'Hledat...',
  onSearch,
  searchValue,
}: SearchFieldProps) => {
  const [value, setValue] = useState(searchValue ?? '')
  const debouncedValue = useDebounce(value, 300)

  // Track the value we last propagated so we only call onSearch when the
  // debounced input actually changes — never on mount or unrelated re-renders.
  const lastSearched = useRef(searchValue ?? '')

  useEffect(() => {
    if (debouncedValue === lastSearched.current) return
    lastSearched.current = debouncedValue
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  return (
    <Input
      className="max-w-xs self-center"
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
