import { EquipmentItemType } from '@ski-blazek/db/browser'
import { DeleteDialog } from '../../_shared/components/DeleteDialog'
import { useDeleteItem } from '../../_shared/queries/equipmentQueries'
import type { HelmetListItem } from '../helmet.types'
import { HelmetDialogDescription } from './HelmetDialogDescription'

type DeleteHelmetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: HelmetListItem
}

export const DeleteHelmetDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: DeleteHelmetDialogProps) => {
  const deleteHelmet = useDeleteItem(EquipmentItemType.HELMET)

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete smazat tuto helmu?"
      description="Tato akce je nevratná a helma bude smazána z databáze."
      onDelete={() => deleteHelmet.mutate({ id: defaultValues.equipmentItemId })}
    >
      <HelmetDialogDescription defaultValues={defaultValues} />
    </DeleteDialog>
  )
}
