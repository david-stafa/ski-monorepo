import type { Person } from '@ski-blazek/db'
import { Gender } from '@ski-blazek/db/browser'
import z from 'zod'

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
