import { EquipmentItemType } from '@ski-blazek/db/browser'
import { RetireDialog } from '../../_shared/components/RetireDialog'
import { useRetireItem } from '../../_shared/queries/equipmentQueries'
import type { SkiBootListItem } from '../skiBoot.types'
import { SkiBootDialogDescription } from './SkiBootDialogDescription'

type RetireSkiBootDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SkiBootListItem
}

export const RetireSkiBootDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: RetireSkiBootDialogProps) => {
  const retireSkiBoot = useRetireItem(EquipmentItemType.SKI_BOOT)

  return (
    <RetireDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete archivovat tuto lyžařskou botu?"
      description="Tato akce vyřadí lyžařskou botu z aktivního seznamu (nebude ji možné rezervovat). Tato akce je vratná."
      onRetire={() =>
        retireSkiBoot.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <SkiBootDialogDescription defaultValues={defaultValues} />
    </RetireDialog>
  )
}
