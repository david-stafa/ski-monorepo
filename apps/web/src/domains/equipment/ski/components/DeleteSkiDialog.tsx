import { EquipmentItemType } from '@ski-blazek/db/browser'
import { DeleteDialog } from '../../_shared/components/DeleteDialog'
import { useDeleteItem } from '../../_shared/queries/equipmentQueries'
import type { SkiListItem } from '../ski.types'
import { SkiDialogDescription } from './SkiDialogDescription'

type DeleteSkiDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SkiListItem
}

export const DeleteSkiDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: DeleteSkiDialogProps) => {
  const deleteSki = useDeleteItem(EquipmentItemType.SKI)

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete smazat tuto lyži?"
      description="Tato akce je nevratná a lyže bude smazána z databáze."
      onDelete={() => deleteSki.mutate({ id: defaultValues.equipmentItemId })}
    >
      <SkiDialogDescription defaultValues={defaultValues} />
    </DeleteDialog>
  )
}
