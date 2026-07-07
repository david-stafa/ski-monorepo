import { EquipmentItemType } from '@ski-blazek/db/browser'
import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import { useDeleteItem } from '../../_shared/queries/equipmentQueries'
import { DeleteDialog } from '../../_shared/components/DeleteDialog'
import type { HelmetListItem } from '../helmet.types'

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
      onDelete={() =>
        deleteHelmet.mutate({ id: defaultValues.equipmentItemId })
      }
    >
      <Separator />
      <div className="flex flex-col gap-2">
        <TypographySmall>Název: {defaultValues.name}</TypographySmall>
        <TypographySmall>Velikost: {defaultValues.size}</TypographySmall>
        <TypographySmall>Barva: {defaultValues.color}</TypographySmall>
        <TypographySmall>
          Integrované brýle:{' '}
          {defaultValues.withIntegratedGoggles ? 'Ano' : 'Ne'}
        </TypographySmall>
        {defaultValues.description && (
          <TypographySmall>Popis: {defaultValues.description}</TypographySmall>
        )}
      </div>
    </DeleteDialog>
  )
}
