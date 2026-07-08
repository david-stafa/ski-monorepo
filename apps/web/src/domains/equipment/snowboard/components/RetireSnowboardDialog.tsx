import { EquipmentItemType } from '@ski-blazek/db/browser'
import { RetireDialog } from '../../_shared/components/RetireDialog'
import { useRetireItem } from '../../_shared/queries/equipmentQueries'
import type { SnowboardListItem } from '../snowboard.types'
import { SnowboardDialogDescription } from './SnowboardDialogDescription'

type RetireSnowboardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SnowboardListItem
}

export const RetireSnowboardDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: RetireSnowboardDialogProps) => {
  const retireSnowboard = useRetireItem(EquipmentItemType.SNOWBOARD)

  return (
    <RetireDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete archivovat tento snowboard?"
      description="Tato akce vyřadí snowboard z aktivního seznamu (nebude ho možné rezervovat). Tato akce je vratná."
      onRetire={() =>
        retireSnowboard.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <SnowboardDialogDescription defaultValues={defaultValues} />
    </RetireDialog>
  )
}
