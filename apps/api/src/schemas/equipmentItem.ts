import { EquipmentItemType } from '@ski-blazek/db/browser'
import z from 'zod'

export const equipmentIdInputSchema = z.object({
  id: z.string(),
})
export type EquipmentIdInput = z.infer<typeof equipmentIdInputSchema>

export const findAvailableInputSchema = z.object({
  type: z.enum(EquipmentItemType),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
})

export type FindAvailableInput = z.infer<typeof findAvailableInputSchema>

export const isItemAvailableInputSchema = z.object({
  id: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
})

export type IsItemAvailableInput = z.infer<typeof isItemAvailableInputSchema>
