import { EquipmentItemType } from '@ski-blazek/db/browser'
import { DeleteDialog } from '../../_shared/components/DeleteDialog'
import { useDeleteItem } from '../../_shared/queries/equipmentQueries'
import type { SnowboardBootListItem } from '../snowboardBoot.types'
import { SnowboardBootDialogDescription } from './SnowboardBootDialogDescription'

type DeleteSnowboardBootDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SnowboardBootListItem
}

export const DeleteSnowboardBootDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: DeleteSnowboardBootDialogProps) => {
  const deleteSnowboardBoot = useDeleteItem(EquipmentItemType.SNOWBOARD_BOOT)

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete smazat tuto snowboardovou botu?"
      description="Tato akce je nevratná a snowboardová bota bude smazána z databáze."
      onDelete={() =>
        deleteSnowboardBoot.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <SnowboardBootDialogDescription defaultValues={defaultValues} />
    </DeleteDialog>
  )
}
