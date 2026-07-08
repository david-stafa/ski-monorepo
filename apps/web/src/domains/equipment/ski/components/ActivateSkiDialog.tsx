import { EquipmentItemType } from '@ski-blazek/db/browser'
import { ActivateDialog } from '../../_shared/components/ActivateDialog'
import { useUnretireItem } from '../../_shared/queries/equipmentQueries'
import type { SkiListItem } from '../ski.types'
import { SkiDialogDescription } from './SkiDialogDescription'

type ActivateSkiDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SkiListItem
}

export const ActivateSkiDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: ActivateSkiDialogProps) => {
  const ActivateSki = useUnretireItem(EquipmentItemType.SKI)

  return (
    <ActivateDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete aktivovat tuto lyži?"
      description="Tato akce vrátí lyži do aktivního seznamu (bude ji možné rezervovat). Tato akce je vratná."
      onActivate={() =>
        ActivateSki.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <SkiDialogDescription defaultValues={defaultValues} />
    </ActivateDialog>
  )
}
