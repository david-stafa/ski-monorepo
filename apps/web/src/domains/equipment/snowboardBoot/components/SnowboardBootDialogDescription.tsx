import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import type { SnowboardBootListItem } from '../snowboardBoot.types'

type SnowboardBootDialogDescriptionProps = {
  defaultValues: SnowboardBootListItem
}

export const SnowboardBootDialogDescription = ({
  defaultValues,
}: SnowboardBootDialogDescriptionProps) => {
  return (
    <>
      <Separator />
      <div className="flex flex-col gap-2">
        <TypographySmall>Značka: {defaultValues.brand}</TypographySmall>
        <TypographySmall>Model: {defaultValues.model}</TypographySmall>
        <TypographySmall>Délka: {defaultValues.length} cm</TypographySmall>
        <TypographySmall>
          BOA systém: {defaultValues.isBoa ? 'Ano' : 'Ne'}
        </TypographySmall>
        <TypographySmall>
          Archivováno: {defaultValues.equipmentItem.retiredAt ? 'Ano' : 'Ne'}
        </TypographySmall>
      </div>
    </>
  )
}
