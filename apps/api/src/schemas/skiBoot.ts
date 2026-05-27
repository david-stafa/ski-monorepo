import { z } from 'zod'
import { paginationSchema } from './pagination'

export const getSkiBootInputSchema = paginationSchema.extend({})
export type GetSkiBootInput = z.infer<typeof getSkiBootInputSchema>
