import { z } from 'zod'
import { paginationSchema } from './pagination'

export const getSnowboardInputSchema = paginationSchema.extend({})
export type GetSnowboardInput = z.infer<typeof getSnowboardInputSchema>
