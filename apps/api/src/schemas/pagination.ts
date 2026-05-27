import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  itemsPerPage: z.coerce.number().int().min(1).default(25),
})

export type PaginationInput = z.infer<typeof paginationSchema>
