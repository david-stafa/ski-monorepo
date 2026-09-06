import type { EquipmentItemType } from '@ski-blazek/db/browser'
import { useQuery } from '@tanstack/react-query'
import { SelectField } from '~/components/form/SharedFormFields'
import { trpc } from '~/lib/trpc'
import { getEquipmentItemLabel } from '../helpers/getEquipmentItemLabel'

export const EquipmentSelectField = ({
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
} & Omit<React.ComponentProps<typeof SelectField>, 'options' | 'isLoading'>) => {
	const { data, isLoading } = useQuery(
		trpc.equipment.equipmentItem.findAvailable.queryOptions({
			type,
			startDate,
			endDate,
			excludeReservationId,
		})
	)

	const options = (data ?? []).map((item) => ({
		value: item.id,
		label: getEquipmentItemLabel(item),
	}))

	return <SelectField label={label} options={options} isLoading={isLoading} {...props} />
}
