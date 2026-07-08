import { EquipmentItemType } from '@ski-blazek/db/browser'
import { RetireDialog } from '../../_shared/components/RetireDialog'
import { useRetireItem } from '../../_shared/queries/equipmentQueries'
import type { SkiListItem } from '../ski.types'
import { SkiDialogDescription } from './SkiDialogDescription'

type RetireSkiDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SkiListItem
}

export const RetireSkiDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: RetireSkiDialogProps) => {
  const retireSki = useRetireItem(EquipmentItemType.SKI)

  return (
    <RetireDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete archivovat tuto lyži?"
      description="Tato akce vyřadí lyži z aktivního seznamu (nebude ji možné rezervovat). Tato akce je vratná."
      onRetire={() => retireSki.mutate({ id: defaultValues.equipmentItemId })}
    >
      <SkiDialogDescription defaultValues={defaultValues} />
    </RetireDialog>
  )
}
