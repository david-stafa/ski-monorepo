import { EquipmentItemType } from '@ski-blazek/db/browser'
import { DeleteDialog } from '../../_shared/components/DeleteDialog'
import { useDeleteItem } from '../../_shared/queries/equipmentQueries'
import type { SkiBootListItem } from '../skiBoot.types'
import { SkiBootDialogDescription } from './SkiBootDialogDescription'

type DeleteSkiBootDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SkiBootListItem
}

export const DeleteSkiBootDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: DeleteSkiBootDialogProps) => {
  const deleteSkiBoot = useDeleteItem(EquipmentItemType.SKI_BOOT)

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete smazat tuto lyžařskou botu?"
      description="Tato akce je nevratná a lyžařská bota bude smazána z databáze."
      onDelete={() =>
        deleteSkiBoot.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <SkiBootDialogDescription defaultValues={defaultValues} />
    </DeleteDialog>
  )
}
