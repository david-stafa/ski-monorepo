import z from 'zod'

export const retireEquipmentInputSchema = z.object({
  id: z.string(),
})
export type RetireEquipmenInputSchema = z.infer<
  typeof retireEquipmentInputSchema
>
