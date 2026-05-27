import { z } from 'zod'
import { paginationSchema } from './pagination'

export const getSnowboardBootInputSchema = paginationSchema.extend({})
export type GetSnowboardBootInput = z.infer<typeof getSnowboardBootInputSchema>
