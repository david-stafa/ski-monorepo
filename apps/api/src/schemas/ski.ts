import { z } from 'zod'
import { paginationSchema } from './pagination'

export const getSkiInputSchema = paginationSchema.extend({})
export type GetSkiInput = z.infer<typeof getSkiInputSchema>
