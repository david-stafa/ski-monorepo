import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import type { SnowboardListItem } from '../snowboard.types'

type SnowboardDialogDescriptionProps = {
  defaultValues: SnowboardListItem
}

export const SnowboardDialogDescription = ({
  defaultValues,
}: SnowboardDialogDescriptionProps) => {
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
