'use client'

import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from '@ski-blazek/ui/components/combobox'
import * as React from 'react'

export type CreatableComboboxOption = {
	value: string
	label: string
}

/**
 * An option, or the "use what I typed" entry. `creatable` holds the raw query
 * rather than a boolean, so one field is both the type guard and the value to
 * commit.
 */
type CreatableComboboxItem = CreatableComboboxOption & { creatable?: string }

const isCreatable = (
	item: CreatableComboboxItem | null | undefined
): item is CreatableComboboxOption & { creatable: string } => typeof item?.creatable === 'string'

/**
 * A combobox that also accepts something not on the list: an unmatched query is
 * offered as its own entry, and picking it commits what was typed. Always
 * creatable — for a list that can only be chosen from, compose the plain
 * `Combobox` next door instead.
 *
 * Everything here is strings; callers holding a number convert on the way in and
 * out, the same split `SelectField` already uses.
 */
function CreatableCombobox({
	value,
	onValueChange,
	options,
	isCustomValueValid = () => true,
	placeholder = 'Select…',
	emptyText = 'Nothing found.',
	customValueLabel = (query) => `Use "${query}"`,
	disabled = false,
	id,
	onBlur,
	className,
}: {
	/** `''` means empty. May be a value that is not in `options`. */
	value: string
	onValueChange: (value: string) => void
	options: CreatableComboboxOption[]
	/**
	 * Narrows what counts as a usable custom value — a numeric field uses it so
	 * that typing letters offers nothing rather than offering a dead entry.
	 * A list that cannot be added to at all wants the plain `Combobox` instead.
	 */
	isCustomValueValid?: (query: string) => boolean
	placeholder?: string
	emptyText?: string
	customValueLabel?: (query: string) => string
	disabled?: boolean
	id?: string
	onBlur?: () => void
	className?: string
}) {
	// Only what the user typed, which is what decides whether to offer the create
	// entry. Base UI owns the input's text itself.
	const [query, setQuery] = React.useState('')

	const trimmed = query.trim()
	const needle = trimmed.toLowerCase()

	const alreadyAnOption = options.some(
		(option) => option.value.toLowerCase() === needle || option.label.toLowerCase() === needle
	)

	/**
	 * The create entry goes last, behind the real matches: `autoHighlight`
	 * highlights the first row, and typing `Ato` should leave Enter on the Atomic
	 * option rather than on "use the letters I typed".
	 *
	 * Base UI filters with `contains(item, query, itemToStringLabel)`, and for
	 * this entry that answers the raw query — so it matches itself and can never
	 * be filtered out of its own list.
	 */
	const items: CreatableComboboxItem[] =
		trimmed !== '' && !alreadyAnOption && isCustomValueValid(trimmed)
			? [...options, { value: trimmed, label: customValueLabel(trimmed), creatable: trimmed }]
			: options

	/**
	 * A custom value has no option to read a label from, so it stands in for
	 * itself — that is what keeps a typed-in brand visible after the list closes.
	 *
	 * Memoised because Base UI re-derives the input's text from this object, and a
	 * new one on every render resets that text — typing into a field whose value
	 * is not on the list would be wiped one keystroke at a time.
	 */
	const selected: CreatableComboboxItem | null = React.useMemo(
		() =>
			value === ''
				? null
				: (options.find((option) => option.value === value) ?? { value, label: value }),
		[value, options]
	)

	return (
		<Combobox
			items={items}
			value={selected}
			onValueChange={(item: CreatableComboboxItem | null) => {
				onValueChange(isCreatable(item) ? item.creatable : (item?.value ?? ''))
				setQuery('')
			}}
			// Base UI also fires this when it fills the input itself — opening writes
			// the selected item's label there. Only what the user typed counts, or a
			// value already chosen would be offered back as a new one.
			onInputValueChange={(next: string, details: { reason: string }) =>
				setQuery(details.reason === 'input-change' ? next : '')
			}
			// What the input shows once an item is chosen. The create entry's label is
			// the prompt ("Use …"), so it has to answer with the raw text instead.
			itemToStringLabel={(item: CreatableComboboxItem) =>
				isCreatable(item) ? item.creatable : item.label
			}
			// `selected` is a fresh object whenever it stands in for a custom value,
			// so compare on the value rather than by reference.
			isItemEqualToValue={(a: CreatableComboboxItem, b: CreatableComboboxItem) =>
				a?.value === b?.value
			}
			openOnInputClick
			// Base UI highlights nothing by default, which leaves Enter doing nothing
			// after you type. Highlighting the top match makes "type it, press Enter"
			// work — the fastest path when adding a brand that isn't on the list.
			autoHighlight
			disabled={disabled}
			onOpenChange={(open: boolean) => {
				setQuery('')
				// The input does not blur on its own when the list closes, so the form
				// is told here instead — that is what marks the field touched.
				if (!open) {
					onBlur?.()
				}
			}}
		>
			<ComboboxInput id={id} placeholder={placeholder} disabled={disabled} className={className} />
			<ComboboxContent>
				<ComboboxEmpty>{emptyText}</ComboboxEmpty>
				<ComboboxList>
					{(item: CreatableComboboxItem) => (
						<ComboboxItem key={item.value} value={item}>
							{item.label}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	)
}

export { CreatableCombobox }
