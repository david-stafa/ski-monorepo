import type { SkiBoot } from '@ski-blazek/db/browser'
import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import { DeleteDialog } from '../DeleteDialog'
import { useDeleteSkiBoot } from './queries/skiBootQueries'

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
  const deleteSkiBoot = useDeleteSkiBoot()

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opravdu chcete smazat tuto lyžařskou botu?"
      description="Tato akce je nevratná a lyžařská bot bude smazána z databáze."
      onDelete={() => deleteSkiBoot.mutate(defaultValues.id)}
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
