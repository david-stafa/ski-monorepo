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
  ...props
}: {
  label: string
  type: EquipmentItemType
  startDate: Date
  endDate: Date
} & Omit<
  React.ComponentProps<typeof SelectField>,
  'options' | 'isLoading'
>) => {
  const { data, isLoading } = useQuery(
    trpc.equipment.equipmentItem.findAvailable.queryOptions({
      type,
      startDate,
      endDate,
    })
  )

  const options = (data ?? []).map((item) => ({
    value: item.id,
    label: getEquipmentItemLabel(item),
  }))

  return (
    <SelectField
      label={label}
      options={options}
      isLoading={isLoading}
      {...props}
    />
  )
}
