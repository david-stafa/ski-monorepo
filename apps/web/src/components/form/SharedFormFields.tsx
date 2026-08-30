import { Button } from '@ski-blazek/ui/components/button'
import { Checkbox } from '@ski-blazek/ui/components/checkbox'
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from '@ski-blazek/ui/components/combobox'
import { CreatableCombobox } from '@ski-blazek/ui/components/creatable-combobox'
import { Input } from '@ski-blazek/ui/components/input'
import { Label } from '@ski-blazek/ui/components/label'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@ski-blazek/ui/components/select'
import { Textarea } from '@ski-blazek/ui/components/textarea'
import { cn } from '@ski-blazek/ui/lib/utils'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import * as React from 'react'
import { FieldInfo } from './FieldInfo'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
	createFormHookContexts()

function TextField({ label, ...props }: { label: string } & React.ComponentProps<typeof Input>) {
	const field = useFieldContext<string | null>()
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Input
				id={field.name}
				value={field.state.value ?? ''}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value === '' ? null : e.target.value)}
				{...props}
			/>
			<FieldInfo field={field} />
		</div>
	)
}

function TextAreaField({
	label,
	...props
}: { label: string } & React.ComponentProps<typeof Textarea>) {
	const field = useFieldContext<string | null>()
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Textarea
				id={field.name}
				value={field.state.value ?? ''}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				{...props}
			/>
			<FieldInfo field={field} />
		</div>
	)
}

function NumberField({ label, ...props }: { label: string } & React.ComponentProps<typeof Input>) {
	const field = useFieldContext<number | null>()
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Input
				type="number"
				id={field.name}
				value={field.state.value ?? ''}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value === '' ? null : e.target.valueAsNumber)}
				{...props}
			/>
			<FieldInfo field={field} />
		</div>
	)
}

function CheckboxField({
	label,
	orientation = 'inline',
	className,
	...props
}: {
	label: string
	/**
	 * `inline` puts the label beside the box — right for a group of standalone
	 * toggles. `stacked` puts it above, matching TextField/SelectField, so the
	 * field lines up when it shares a row with them.
	 */
	orientation?: 'inline' | 'stacked'
} & React.ComponentProps<typeof Checkbox>) {
	const field = useFieldContext<boolean>()
	const checkbox = (
		<Checkbox
			id={field.name}
			checked={field.state.value}
			onBlur={field.handleBlur}
			onCheckedChange={(checked) => field.handleChange(checked === true)}
			className={cn('h-6 w-6', className)}
			{...props}
		/>
	)

	if (orientation === 'stacked') {
		return (
			<div className="flex flex-col gap-2">
				<Label htmlFor={field.name}>{label}</Label>
				{/* h-9 is the Input / SelectTrigger height, so the box sits on the
            same line as the controls next to it */}
				<div className="flex h-9 items-center">{checkbox}</div>
				<FieldInfo field={field} />
			</div>
		)
	}

	return (
		<div className="flex gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			{checkbox}
			<FieldInfo field={field} />
		</div>
	)
}

export type SelectFieldOption<TValue extends string | number = string> = {
	value: TValue
	label: string
	disabled?: boolean
}

const NONE_VALUE = '__none__'

/**
 * Presentational only — it takes ready-made options. Anything that has to
 * *fetch* its options composes this from its own domain folder rather than
 * pulling data-loading into the shared form kit.
 *
 * Base UI's Select only speaks strings, so option values are stringified on the
 * way in and mapped back to the original option on the way out — that keeps a
 * numeric field (pole length) numeric in form state.
 */
export function SelectField<TValue extends string | number = string>({
	label,
	options,
	placeholder,
	isLoading = false,
	withoutNoneOption = false,
	noneLabel = 'Žádné',
	className,
	...props
}: {
	label: string
	options: SelectFieldOption<TValue>[]
	placeholder?: string
	isLoading?: boolean
	withoutNoneOption?: boolean
	noneLabel?: string
	className?: string
} & React.ComponentProps<typeof Select>) {
	const field = useFieldContext<TValue | null>()
	const items: Record<string, React.ReactNode> = {
		[NONE_VALUE]: noneLabel,
		...Object.fromEntries(options.map((option) => [String(option.value), option.label])),
	}
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Select
				// Base UI's `<SelectValue>` renders the raw value unless the root is
				// given an `items` map — that map is what shows the option's label.
				items={items}
				// null is Base UI's "no value" — it keeps the Select controlled while
				// empty and lets `<SelectValue>` fall back to the placeholder
				value={field.state.value == null ? null : String(field.state.value)}
				onValueChange={(value) => {
					if (value === NONE_VALUE) return field.handleChange(null)
					const option = options.find((o) => String(o.value) === value)
					field.handleChange(option ? option.value : null)
				}}
				disabled={isLoading}
				{...props}
			>
				<SelectTrigger
					id={field.name}
					onBlur={field.handleBlur}
					className={className ?? 'w-fit max-w-52'}
				>
					<SelectValue
						placeholder={isLoading ? 'Načítání…' : (placeholder ?? `Vyberte ${label}`)}
					/>
				</SelectTrigger>
				<SelectContent className="w-fit">
					<SelectGroup>
						<SelectLabel>{label}</SelectLabel>
						{!withoutNoneOption && <SelectItem value={NONE_VALUE}>{noneLabel}</SelectItem>}
						{options.map((option) => (
							<SelectItem
								value={String(option.value)}
								key={option.value}
								disabled={option.disabled}
							>
								{option.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<FieldInfo field={field} />
		</div>
	)
}

/**
 * Pick a brand from the list, or type one that isn't on it. Kept separate from
 * `CreatableNumberComboboxField` rather than made generic: the two differ only in
 * how a typed-in value is read back, and two short obvious components beat one
 * with a parser prop.
 */
function CreatableComboboxField({
	label,
	options,
	placeholder,
	className,
	...props
}: {
	label: string
	options: SelectFieldOption<string>[]
	placeholder?: string
	className?: string
} & Omit<
	React.ComponentProps<typeof CreatableCombobox>,
	'value' | 'onValueChange' | 'options' | 'label'
>) {
	const field = useFieldContext<string | null>()
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			<CreatableCombobox
				id={field.name}
				value={field.state.value ?? ''}
				onValueChange={(value) => field.handleChange(value === '' ? null : value)}
				onBlur={field.handleBlur}
				options={options}
				// Deliberately not `Vyberte ${label}` — Czech would need the label in
				// the accusative, so callers pass the wording when it matters.
				placeholder={placeholder ?? 'Vyberte…'}
				emptyText="Nic nenalezeno."
				customValueLabel={(search) => `Použít „${search}“`}
				className={className ?? 'max-w-48'}
				{...props}
			/>
			<FieldInfo field={field} />
		</div>
	)
}

/** Digits with an optional half step — `165`, `26.5` and `26,5` all pass. */
const NUMERIC_INPUT = /^\d+([.,]\d+)?$/

/**
 * The numeric twin of `CreatableComboboxField`, for lengths that may be off the
 * catalog. Form state stays a number; the combobox only ever sees strings, so the
 * value is stringified on the way in and parsed on the way out — the same split
 * `SelectField` uses.
 */
function CreatableNumberComboboxField({
	label,
	options,
	unit,
	placeholder,
	className,
	...props
}: {
	label: string
	options: SelectFieldOption<number>[]
	/** Appended to a typed-in value so `165` reads back as `165 cm`. */
	unit?: string
	placeholder?: string
	className?: string
} & Omit<
	React.ComponentProps<typeof CreatableCombobox>,
	'value' | 'onValueChange' | 'options' | 'label'
>) {
	const field = useFieldContext<number | null>()
	// Memoised because the identity matters, not just the contents: Base UI
	// re-derives the input's text from the selected item, so a fresh array of
	// fresh objects on every render wipes what is being typed, one keystroke at a
	// time. The string-keyed catalogs are module constants and need no such care.
	const stringOptions = React.useMemo(
		() => options.map((option) => ({ value: String(option.value), label: option.label })),
		[options]
	)
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			<CreatableCombobox
				id={field.name}
				value={field.state.value == null ? '' : String(field.state.value)}
				onValueChange={(value) =>
					// A comma is what a Czech keyboard produces for a half size.
					field.handleChange(value === '' ? null : Number(value.replace(',', '.')))
				}
				onBlur={field.handleBlur}
				options={stringOptions}
				isCustomValueValid={(search) => NUMERIC_INPUT.test(search)}
				placeholder={placeholder ?? 'Vyberte…'}
				emptyText="Nic nenalezeno."
				customValueLabel={(search) => `Použít ${search}${unit ? ` ${unit}` : ''}`}
				className={className ?? 'max-w-48'}
				{...props}
			/>
			<FieldInfo field={field} />
		</div>
	)
}

/**
 * A closed list of numbers, filtered by typing. Boot sizes are a standard scale,
 * so anything off it is a typo rather than a boot — this is built on the plain
 * `Combobox` precisely because nothing here can invent a value.
 */
function NumberComboboxField({
	label,
	options,
	placeholder,
	className,
}: {
	label: string
	options: SelectFieldOption<number>[]
	placeholder?: string
	className?: string
}) {
	const field = useFieldContext<number | null>()
	// Base UI re-derives the input's text from the selected item, so this has to
	// keep a stable identity between renders — a fresh object every time wipes
	// what is being typed, one keystroke at a time.
	const selected = React.useMemo(
		() => options.find((option) => option.value === field.state.value) ?? null,
		[options, field.state.value]
	)
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Combobox
				items={options}
				value={selected}
				onValueChange={(item: SelectFieldOption<number> | null) =>
					field.handleChange(item ? item.value : null)
				}
				isItemEqualToValue={(a: SelectFieldOption<number>, b: SelectFieldOption<number>) =>
					a?.value === b?.value
				}
				openOnInputClick
				autoHighlight
				onOpenChange={(open: boolean) => {
					// The input does not blur on its own when the list closes, so the form
					// is told here instead — that is what marks the field touched.
					if (!open) {
						field.handleBlur()
					}
				}}
			>
				<ComboboxInput
					id={field.name}
					placeholder={placeholder ?? 'Vyberte…'}
					className={className ?? 'max-w-48'}
				/>
				<ComboboxContent>
					<ComboboxEmpty>Nic nenalezeno.</ComboboxEmpty>
					<ComboboxList>
						{(item: SelectFieldOption<number>) => (
							<ComboboxItem key={item.value} value={item}>
								{item.label}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
			<FieldInfo field={field} />
		</div>
	)
}

function SubscribeButton({
	label,
	...props
}: { label: string } & React.ComponentProps<typeof Button>) {
	const form = useFormContext()
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button disabled={isSubmitting} {...props}>
					{label}
				</Button>
			)}
		</form.Subscribe>
	)
}

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldComponents: {
		TextField,
		NumberField,
		CheckboxField,
		TextAreaField,
		SelectField,
		CreatableComboboxField,
		CreatableNumberComboboxField,
		NumberComboboxField,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
})
