import { EquipmentItemType } from '@ski-blazek/db/browser'
import { DeleteDialog } from '../../_shared/components/DeleteDialog'
import { useDeleteItem } from '../../_shared/queries/equipmentQueries'
import type { SnowboardListItem } from '../snowboard.types'
import { SnowboardDialogDescription } from './SnowboardDialogDescription'

type DeleteSnowboardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SnowboardListItem
}

export const DeleteSnowboardDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: DeleteSnowboardDialogProps) => {
  const deleteSnowboard = useDeleteItem(EquipmentItemType.SNOWBOARD)

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete smazat tento snowboard?"
      description="Tato akce je nevratná a snowboard bude smazán z databáze."
      onDelete={() =>
        deleteSnowboard.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <SnowboardDialogDescription defaultValues={defaultValues} />
    </DeleteDialog>
  )
}
