import { z } from 'zod'
import { paginationSchema } from './pagination'
import type { Ski } from '@ski-blazek/db'

export const getSkiInputSchema = paginationSchema.extend({
  search: z.string().optional(),
  orderBy: z.enum(['length', 'brand', 'model', 'isVIP']).default('length'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
})
export type GetSkiInput = z.infer<typeof getSkiInputSchema>

export type CreateSkiInput = Omit<Ski, 'id' | 'createdAt' | 'updatedAt'>
export const createSkiInputSchema = z.object({
  brand: z.string(),
  model: z.string(),
  length: z.number().int(),
  isVIP: z.boolean(),
}) satisfies z.ZodType<CreateSkiInput>
// TODO: satisfied does not catches extra fields outside of the CreateSkiInput type
