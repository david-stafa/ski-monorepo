import type { Snowboard } from '@ski-blazek/db/browser'
import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import { DeleteDialog } from '../DeleteDialog'
import { useDeleteSnowboard } from './queries/snowboardQueries'

type DeleteSnowboardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: Omit<Snowboard, 'createdAt' | 'updatedAt'>
}

export const DeleteSnowboardDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: DeleteSnowboardDialogProps) => {
  const deleteSnowboard = useDeleteSnowboard()

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete smazat tento snowboard?"
      description="Tato akce je nevratná a snowboard bude smazán z databáze."
      onDelete={() => deleteSnowboard.mutate(defaultValues.id)}
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
