import { z } from 'zod'
import { paginationSchema } from './pagination'

export const getSkiInputSchema = paginationSchema.extend({
    orderBy: z.enum(['length', 'brand', 'model', 'isVIP']).default('length'),
    orderDirection: z.enum(['asc', 'desc']).default('asc'),
})
export type GetSkiInput = z.infer<typeof getSkiInputSchema>
