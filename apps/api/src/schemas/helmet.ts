import { z } from 'zod'
import { paginationSchema } from './pagination'

export const getHelmetInputSchema = paginationSchema.extend({})
export type GetHelmetInput = z.infer<typeof getHelmetInputSchema>
