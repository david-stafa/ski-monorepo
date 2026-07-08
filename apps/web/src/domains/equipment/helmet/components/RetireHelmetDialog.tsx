import { EquipmentItemType } from '@ski-blazek/db/browser'
import { RetireDialog } from '../../_shared/components/RetireDialog'
import { useRetireItem } from '../../_shared/queries/equipmentQueries'
import type { HelmetListItem } from '../helmet.types'
import { HelmetDialogDescription } from './HelmetDialogDescription'

type RetireHelmetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: HelmetListItem
}

export const RetireHelmetDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: RetireHelmetDialogProps) => {
  const retireHelmet = useRetireItem(EquipmentItemType.HELMET)

  return (
    <RetireDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete archivovat tuto helmu?"
      description="Tato akce vyřadí helmu z aktivního seznamu (nebude ji možné rezervovat). Tato akce je vratná."
      onRetire={() => retireHelmet.mutate({ id: defaultValues.equipmentItemId })}
    >
      <HelmetDialogDescription defaultValues={defaultValues} />
    </RetireDialog>
  )
}
