import { EquipmentItemType } from '@ski-blazek/db/browser'
import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import { useDeleteItem } from '../../_shared/queries/equipmentQueries'
import { DeleteDialog } from '../../_shared/components/DeleteDialog'
import type { SnowboardListItem } from '../snowboard.types'

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
      <Separator />
      <div className="flex flex-col gap-2">
        <TypographySmall>Značka: {defaultValues.brand}</TypographySmall>
        <TypographySmall>Model: {defaultValues.model}</TypographySmall>
        <TypographySmall>Délka: {defaultValues.length} cm</TypographySmall>
      </div>
    </DeleteDialog>
  )
}
