import { EquipmentItemType } from '@ski-blazek/db/browser'
import z from 'zod'

export const equipmentIdInputSchema = z.object({
  id: z.string(),
})
export type EquipmentIdInput = z.infer<typeof equipmentIdInputSchema>

export const findAvailableInputSchema = z.object({
  type: z.enum(EquipmentItemType),
  startDate: z.date(),
  endDate: z.date(),
})

export type FindAvailableInput = z.infer<typeof findAvailableInputSchema>