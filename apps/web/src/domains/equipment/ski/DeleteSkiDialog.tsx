import { EquipmentItemType, type Ski } from '@ski-blazek/db/browser'
import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import { useDeleteItem } from '../_shared/queries/equipmentQueries'
import { DeleteDialog } from '../DeleteDialog'

type DeleteSkiDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: Omit<Ski, 'createdAt' | 'updatedAt'>
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
      <Separator />
      <div className="flex flex-col gap-2">
        <TypographySmall>Značka: {defaultValues.brand}</TypographySmall>
        <TypographySmall>Model: {defaultValues.model}</TypographySmall>
        <TypographySmall>Délka: {defaultValues.length} cm</TypographySmall>
        <TypographySmall>
          VIP: {defaultValues.isVIP ? 'Ano' : 'Ne'}
        </TypographySmall>
      </div>
    </DeleteDialog>
  )
}
