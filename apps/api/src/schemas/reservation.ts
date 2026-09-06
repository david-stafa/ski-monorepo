import type { EquipmentItemType, Person } from '@ski-blazek/db'
import { Gender, Goggle, Level, PersonStatus, ReservationStatus } from '@ski-blazek/db/browser'
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

export type PersonEquipment = z.infer<typeof personEquipmentSchema>

/** Every equipment slot unassigned — used for new people, for wiping selections
 * that a date change may have invalidated, and as the seed when folding a
 * person's reservationItems back into slots. */
export const createEmptyEquipment = (): PersonEquipment => ({
	SKI: null,
	SKI_BOOT: null,
	SNOWBOARD: null,
	SNOWBOARD_BOOT: null,
	HELMET: null,
})

// person + the gear assigned to them.
// `id` absent = a new person, present = an existing row being edited. That one
// optional field is the only difference between the create and update payloads.
export const personInputSchema = personFieldsSchema.extend({
	id: z.string().optional(),
	equipment: personEquipmentSchema,
})

// unrefined base, so both the input and the detail shape can extend it
const reservationFieldsSchema = z.object({
	name: z.string().min(2, 'Jméno musí mít alespoň dva znaky'),
	phoneNumber: z.string().trim().min(9, 'Telefon musí mít alespoň 9 čísel'),
	note: z.string().nullable(),
	startDate: z.date(),
	endDate: z.date(),
})

// unrefined so the update payload can extend it; the refinement is applied to
// both exported schemas below
const reservationBodySchema = reservationFieldsSchema.extend({
	people: z.array(personInputSchema).min(1),
})

const datesOrdered = {
	check: (data: { startDate: Date; endDate: Date }) => data.startDate < data.endDate,
	error: {
		error: 'Začátek rezervace musí být dřív než konec rezervace',
		path: ['endDate'],
	},
}

export const reservationInputSchema = reservationBodySchema.refine(
	datesOrdered.check,
	datesOrdered.error
)

export type ReservationInput = z.infer<typeof reservationInputSchema>

/** The same body plus which reservation to write it to. */
export const updateReservationInputSchema = reservationBodySchema
	.extend({ id: z.string() })
	.refine(datesOrdered.check, datesOrdered.error)

export type UpdateReservationInput = z.infer<typeof updateReservationInputSchema>

/** What `reservation.get` returns: the form's own shape plus the server-owned
 * fields. Structurally assignable to ReservationInput, so the edit form can
 * consume it with no mapping on the client. */
export const reservationDetailSchema = reservationFieldsSchema.extend({
	id: z.string(),
	status: z.enum(ReservationStatus),
	people: z.array(
		personInputSchema.extend({
			id: z.string(),
			status: z.enum(PersonStatus),
		})
	),
})

export type ReservationDetail = z.infer<typeof reservationDetailSchema>

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
