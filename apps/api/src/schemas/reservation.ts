import type { Person } from '@ski-blazek/db'
import { Gender, ReservationStatus } from '@ski-blazek/db/browser'
import z from 'zod'
import { paginationSchema } from './pagination'

// DB-aligned person fields (keep the satisfies check on these)
const personFieldsSchema = z.object({
  name: z.string(),
  weight: z.number().int(),
  height: z.number().int(),
  age: z.number().int(),
  gender: z.enum(Gender),
  poles: z.number().int().nullable(),
  backProtection: z.boolean().default(false),
  skiCover: z.boolean().default(false),
  bootCover: z.boolean().default(false),
  goggles: z.boolean().default(false),
}) satisfies z.ZodType<
  Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'reservationId'>
>

// person + the gear assigned to them
const personInputSchema = personFieldsSchema.extend({
  items: z.array(z.object({ equipmentItemId: z.string() })),
})

export const createReservationInputSchema = z
  .object({
    name: z.string(),
    phoneNumber: z.string(),
    note: z.string().nullable(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .extend({
    people: z.array(personInputSchema),
  })
export type CreateReservationInput = z.infer<
  typeof createReservationInputSchema
>

export const getReservationsInputSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(ReservationStatus).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  dateMode: z.enum(['PICKUP', 'RETURN', 'ACTIVE']).default('PICKUP'),
  orderBy: z.enum(['name', 'startDate', 'endDate']).default('startDate'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
})

export type GetReservationsInput = z.infer<typeof getReservationsInputSchema>

export const reservationIdInputSchema = z.object({
  id: z.string(),
})

export type ReservationIdInput = z.infer<typeof reservationIdInputSchema>
