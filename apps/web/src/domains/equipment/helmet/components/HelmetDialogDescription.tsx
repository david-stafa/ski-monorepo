import { Separator } from '@ski-blazek/ui/components/separator'
import { TypographySmall } from '@ski-blazek/ui/components/typography'
import type { HelmetListItem } from '../helmet.types'

type HelmetDialogDescriptionProps = {
  defaultValues: HelmetListItem
}

export const HelmetDialogDescription = ({
  defaultValues,
}: HelmetDialogDescriptionProps) => {
  return (
    <>
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
        <TypographySmall>
          Archivováno: {defaultValues.equipmentItem.retiredAt ? 'Ano' : 'Ne'}
        </TypographySmall>
      </div>
    </>
  )
}
