import type { EquipmentItemType, Person } from '@ski-blazek/db'
import { Gender, Goggle, Level, ReservationStatus } from '@ski-blazek/db/browser'
import z from 'zod'
import { paginationSchema } from './pagination'

// DB-aligned person fields (keep the satisfies check on these)
const personFieldsSchema = z.object({
	name: z.string().min(2, 'Jméno musí mít alespoň dva znaky'),
	weight: z.number().int().min(10, 'Zadejte váhu větší než 10'),
	height: z.number().int().min(80, 'zadejte výšku větší než 80'),
	age: z.number().int().min(1, 'Zadejte věk').max(120, 'Zadejte věk'),
	gender: z.enum(Gender),
	poles: z
		.number()
		.int()
		.min(50, 'Zadejte délku holí větší než 50')
		.max(140, 'Zadejte délku holí menší než 140')
		.nullable(),
	backProtection: z.boolean(),
	skiCover: z.boolean(),
	bootCover: z.boolean(),
	goggles: z.enum(Goggle).nullable(),
	level: z.enum(Level).nullable(),
	note: z.string().nullable(),
}) satisfies z.ZodType<Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'reservationId'>>
// one item per equipment type per person
const personEquipmentSchema = z.object({
	SKI: z.string().nullable(),
	SKI_BOOT: z.string().nullable(),
	SNOWBOARD: z.string().nullable(),
	SNOWBOARD_BOOT: z.string().nullable(),
	HELMET: z.string().nullable(),
}) satisfies z.ZodType<Record<EquipmentItemType, string | null>>

// person + the gear assigned to them
export const personInputSchema = personFieldsSchema.extend({
	equipment: personEquipmentSchema,
})

export const createReservationInputSchema = z
	.object({
		name: z.string().min(2, 'Jméno musí mít alespoň dva znaky'),
		phoneNumber: z.string().trim().min(9, 'Telefon musí mít alespoň 9 čísel'),
		note: z.string().nullable(),
		startDate: z.date(),
		endDate: z.date(),
	})
	.extend({
		people: z.array(personInputSchema).min(1),
	})
	.refine((data) => data.startDate < data.endDate, {
		error: 'Začátek rezervace musí být dřív než konec rezervace',
		path: ['endDate'],
	})

export type CreateReservationInput = z.infer<typeof createReservationInputSchema>

export const getReservationsInputSchema = paginationSchema.extend({
	search: z.string().optional(),
	status: z.enum(ReservationStatus).optional(),
	// date-only ISO strings ('2026-08-06') — these live in the URL as search
	// params, so keep them readable; listReservations widens them to a day range
	from: z.iso.date().optional(),
	to: z.iso.date().optional(),
	dateMode: z.enum(['PICKUP', 'RETURN', 'ACTIVE']).optional(),
	orderBy: z.enum(['name', 'startDate', 'endDate']).default('startDate'),
	orderDirection: z.enum(['asc', 'desc']).default('asc'),
})

export type GetReservationsInput = z.infer<typeof getReservationsInputSchema>

export const reservationIdInputSchema = z.object({
	id: z.string(),
})

export type ReservationIdInput = z.infer<typeof reservationIdInputSchema>
