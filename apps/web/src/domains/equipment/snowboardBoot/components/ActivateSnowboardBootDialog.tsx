import { EquipmentItemType } from '@ski-blazek/db/browser'
import { ActivateDialog } from '../../_shared/components/ActivateDialog'
import { useUnretireItem } from '../../_shared/queries/equipmentQueries'
import type { SnowboardBootListItem } from '../snowboardBoot.types'
import { SnowboardBootDialogDescription } from './SnowboardBootDialogDescription'

type ActivateSnowboardBootDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SnowboardBootListItem
}

export const ActivateSnowboardBootDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: ActivateSnowboardBootDialogProps) => {
  const activateSnowboardBoot = useUnretireItem(EquipmentItemType.SNOWBOARD_BOOT)

  return (
    <ActivateDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete aktivovat tuto snowboardovou botu?"
      description="Tato akce vrátí snowboardovou botu do aktivního seznamu (bude ji možné rezervovat). Tato akce je vratná."
      onActivate={() =>
        activateSnowboardBoot.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <SnowboardBootDialogDescription defaultValues={defaultValues} />
    </ActivateDialog>
  )
}
