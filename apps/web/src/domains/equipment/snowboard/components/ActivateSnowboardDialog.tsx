import { EquipmentItemType } from '@ski-blazek/db/browser'
import { ActivateDialog } from '../../_shared/components/ActivateDialog'
import { useUnretireItem } from '../../_shared/queries/equipmentQueries'
import type { SnowboardListItem } from '../snowboard.types'
import { SnowboardDialogDescription } from './SnowboardDialogDescription'

type ActivateSnowboardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SnowboardListItem
}

export const ActivateSnowboardDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: ActivateSnowboardDialogProps) => {
  const activateSnowboard = useUnretireItem(EquipmentItemType.SNOWBOARD)

  return (
    <ActivateDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete aktivovat tento snowboard?"
      description="Tato akce vrátí snowboard do aktivního seznamu (bude ho možné rezervovat). Tato akce je vratná."
      onActivate={() =>
        activateSnowboard.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <SnowboardDialogDescription defaultValues={defaultValues} />
    </ActivateDialog>
  )
}
