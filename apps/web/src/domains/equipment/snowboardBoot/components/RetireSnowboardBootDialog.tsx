import { EquipmentItemType } from '@ski-blazek/db/browser'
import { RetireDialog } from '../../_shared/components/RetireDialog'
import { useRetireItem } from '../../_shared/queries/equipmentQueries'
import type { SnowboardBootListItem } from '../snowboardBoot.types'
import { SnowboardBootDialogDescription } from './SnowboardBootDialogDescription'

type RetireSnowboardBootDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SnowboardBootListItem
}

export const RetireSnowboardBootDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: RetireSnowboardBootDialogProps) => {
  const retireSnowboardBoot = useRetireItem(EquipmentItemType.SNOWBOARD_BOOT)

  return (
    <RetireDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete archivovat tuto snowboardovou botu?"
      description="Tato akce vyřadí snowboardovou botu z aktivního seznamu (nebude ji možné rezervovat). Tato akce je vratná."
      onRetire={() =>
        retireSnowboardBoot.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <SnowboardBootDialogDescription defaultValues={defaultValues} />
    </RetireDialog>
  )
}
