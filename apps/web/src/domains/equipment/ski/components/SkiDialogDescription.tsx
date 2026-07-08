import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import type { SkiListItem } from '../ski.types'

type SkiDialogDescriptionProps = {
  defaultValues: SkiListItem
}

export const SkiDialogDescription = ({
  defaultValues,
}: SkiDialogDescriptionProps) => {
  return (
    <>
      <Separator />
      <div className="flex flex-col gap-2">
        <TypographySmall>Značka: {defaultValues.brand}</TypographySmall>
        <TypographySmall>Model: {defaultValues.model}</TypographySmall>
        <TypographySmall>Délka: {defaultValues.length} cm</TypographySmall>
        <TypographySmall>
          VIP: {defaultValues.isVIP ? 'Ano' : 'Ne'}
        </TypographySmall>
        <TypographySmall>
          Archivováno: {defaultValues.equipmentItem.retiredAt ? 'Ano' : 'Ne'}
        </TypographySmall>
      </div>
    </>
  )
}
