import { EquipmentItemType, type SkiBoot } from '@ski-blazek/db/browser'
import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import { useDeleteItem } from '../_shared/queries/equipmentQueries'
import { DeleteDialog } from '../DeleteDialog'

type DeleteSkiBootDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: Omit<SkiBoot, 'createdAt' | 'updatedAt'>
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
      description="Tato akce je nevratná a lyžařská bot bude smazána z databáze."
      onDelete={() =>
        deleteSkiBoot.mutate({ id: defaultValues.equipmentItemId })
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
