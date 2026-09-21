import type { EquipmentItemType } from '@ski-blazek/db/browser'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { ComboboxField } from '~/components/form/SharedFormFields'
import { trpc } from '~/lib/trpc'
import { getEquipmentItemLabel } from '../helpers/getEquipmentItemLabel'
import { EquipmentItemOptionLabel } from './EquipmentItemOptionLabel'

export const EquipmentComboboxField = ({
	label,
	type,
	startDate,
	endDate,
	excludeReservationId,
	...props
}: {
	label: string
	type: EquipmentItemType
	startDate: Date
	endDate: Date
	/** Set when editing — keeps the gear this reservation already holds in the
	 * list, which it would otherwise filter out as booked. */
	excludeReservationId?: string
} & Omit<React.ComponentProps<typeof ComboboxField>, 'options' | 'isLoading'>) => {
	const { data, isLoading } = useQuery(
		trpc.equipment.equipmentItem.findAvailable.queryOptions({
			type,
			startDate,
			endDate,
			excludeReservationId,
		})
	)

	// Memoised on `data`: `ComboboxField` compares the selected option by identity
	// to decide whether the selection changed, so rebuilding this array on every
	// render would clear the input mid-keystroke.
	const options = useMemo(
		() =>
			(data ?? []).map((item) => ({
				value: item.id,
				label: getEquipmentItemLabel(item),
				content: <EquipmentItemOptionLabel item={item} />,
			})),
		[data]
	)

	return <ComboboxField label={label} options={options} isLoading={isLoading} {...props} />
}
