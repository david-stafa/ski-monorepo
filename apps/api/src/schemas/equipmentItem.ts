import z from 'zod'

export const retireEquipmentInputSchema = z.object({
  id: z.string(),
})
export type RetireEquipmenInput = z.infer<typeof retireEquipmentInputSchema>

export const deleteEquipmentInputSchema = z.object({
  id: z.string(),
})
export type DeleteEquipmenInput = z.infer<typeof deleteEquipmentInputSchema>
