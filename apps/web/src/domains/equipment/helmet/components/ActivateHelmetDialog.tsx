import { EquipmentItemType } from '@ski-blazek/db/browser'
import { ActivateDialog } from '../../_shared/components/ActivateDialog'
import { useUnretireItem } from '../../_shared/queries/equipmentQueries'
import type { HelmetListItem } from '../helmet.types'
import { HelmetDialogDescription } from './HelmetDialogDescription'

type ActivateHelmetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: HelmetListItem
}

export const ActivateHelmetDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: ActivateHelmetDialogProps) => {
  const activateHelmet = useUnretireItem(EquipmentItemType.HELMET)

  return (
    <ActivateDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete aktivovat tuto helmu?"
      description="Tato akce vrátí helmu do aktivního seznamu (bude ji možné rezervovat). Tato akce je vratná."
      onActivate={() =>
        activateHelmet.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <HelmetDialogDescription defaultValues={defaultValues} />
    </ActivateDialog>
  )
}
