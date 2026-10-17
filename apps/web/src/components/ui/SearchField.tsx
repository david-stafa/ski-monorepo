import { Input } from '@ski-blazek/ui/components/input'
import { cn } from '@ski-blazek/ui/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '~/hooks/useDebounce'

type SearchFieldProps = {
	placeholder?: string
	onSearch: (value: string) => void
	searchValue?: string
	className?: string
}

export const SearchField = ({
	placeholder = 'Hledat...',
	onSearch,
	searchValue,
	className,
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
			className={cn('h-10 xl:max-w-2xs', className)}
			type="text"
			placeholder={placeholder}
			value={value}
			onChange={(e) => setValue(e.target.value)}
		/>
	)
}
