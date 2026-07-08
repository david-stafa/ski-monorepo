import z from 'zod'

export const equipmentIdInputSchema = z.object({
  id: z.string(),
})
export type EquipmentIdInput = z.infer<typeof equipmentIdInputSchema>
