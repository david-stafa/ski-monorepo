import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import type { SkiBootListItem } from '../skiBoot.types'

type SkiBootDialogDescriptionProps = {
  defaultValues: SkiBootListItem
}

export const SkiBootDialogDescription = ({
  defaultValues,
}: SkiBootDialogDescriptionProps) => {
  return (
    <>
      <Separator />
      <div className="flex flex-col gap-2">
        <TypographySmall>Značka: {defaultValues.brand}</TypographySmall>
        <TypographySmall>Model: {defaultValues.model}</TypographySmall>
        <TypographySmall>Délka: {defaultValues.length} cm</TypographySmall>
        <TypographySmall>
          Archivováno: {defaultValues.equipmentItem.retiredAt ? 'Ano' : 'Ne'}
        </TypographySmall>
      </div>
    </>
  )
}
