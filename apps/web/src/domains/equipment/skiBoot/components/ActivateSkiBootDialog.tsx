import { EquipmentItemType } from '@ski-blazek/db/browser'
import { ActivateDialog } from '../../_shared/components/ActivateDialog'
import { useUnretireItem } from '../../_shared/queries/equipmentQueries'
import type { SkiBootListItem } from '../skiBoot.types'
import { SkiBootDialogDescription } from './SkiBootDialogDescription'

type ActivateSkiBootDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SkiBootListItem
}

export const ActivateSkiBootDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: ActivateSkiBootDialogProps) => {
  const activateSkiBoot = useUnretireItem(EquipmentItemType.SKI_BOOT)

  return (
    <ActivateDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete aktivovat tuto lyžařskou botu?"
      description="Tato akce vrátí lyžařskou botu do aktivního seznamu (bude ji možné rezervovat). Tato akce je vratná."
      onActivate={() =>
        activateSkiBoot.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <SkiBootDialogDescription defaultValues={defaultValues} />
    </ActivateDialog>
  )
}
