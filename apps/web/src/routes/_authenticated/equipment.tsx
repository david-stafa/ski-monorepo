import { createFileRoute, Outlet } from '@tanstack/react-router'
import z from 'zod'

const equipmentSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  itemsPerPage: z.coerce.number().int().min(1).default(25),
  // filter: z.string().optional(),
  // sort: z.enum(['asc', 'desc']).optional(),
})
export const Route = createFileRoute('/_authenticated/equipment')({
  validateSearch: equipmentSearchSchema,
  component: () => <Outlet />,
})
