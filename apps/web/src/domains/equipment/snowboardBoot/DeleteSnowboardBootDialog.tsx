import type { SnowboardBoot } from '@ski-blazek/db/browser'
import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import { DeleteDialog } from '../DeleteDialog'
import { useDeleteSnowboardBoot } from './queries/snowboardBootQueries'

type DeleteSnowboardBootDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: Omit<SnowboardBoot, 'createdAt' | 'updatedAt'>
}

export const DeleteSnowboardBootDialog = ({
  open,
  onOpenChange,
  defaultValues,
}: DeleteSnowboardBootDialogProps) => {
  const deleteSnowboardBoot = useDeleteSnowboardBoot()

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete smazat tuto snowboardovou botu?"
      description="Tato akce je nevratná a snowboardová bota bude smazána z databáze."
      onDelete={() => deleteSnowboardBoot.mutate(defaultValues.id)}
    >
      <Separator />
      <div className="flex flex-col gap-2">
        <TypographySmall>Značka: {defaultValues.brand}</TypographySmall>
        <TypographySmall>Model: {defaultValues.model}</TypographySmall>
        <TypographySmall>Délka: {defaultValues.length} cm</TypographySmall>
        <TypographySmall>
          BOA systém: {defaultValues.isBoa ? 'Ano' : 'Ne'}
        </TypographySmall>
      </div>
    </DeleteDialog>
  )
}
