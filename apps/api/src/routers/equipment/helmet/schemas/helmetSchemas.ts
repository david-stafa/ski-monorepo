import type { Helmet } from '@ski-blazek/db'
import z from 'zod'

export type CreateHelmetInput = Omit<Helmet, 'id' | 'createdAt' | 'updatedAt'>

export const createHelmetInputSchema: z.ZodType<CreateHelmetInput> = z.object({
  name: z.string(),
  size: z.string(),
  color: z.string(),
  description: z.string().nullable(),
  withIntegratedGoogles: z.boolean().default(false),
})
