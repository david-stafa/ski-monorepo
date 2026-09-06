import type { Prisma } from '@ski-blazek/db'
import type { ReservationInput } from '../../../schemas/reservation'

type PersonInput = ReservationInput['people'][number]

/**
 * The person's own columns, named one by one.
 *
 * Spreading a zod-inferred person straight into a Prisma `create`/`update`
 * looks tidy but switches off excess-property checking: TypeScript accepts any
 * extra key the schema happens to carry (`id`, say) and Prisma only rejects it
 * at runtime. Listing the columns here is what puts the compiler back in
 * charge — `satisfies` catches a typo'd or removed column, and callers can
 * spread the result safely because it holds nothing but columns.
 */
export const personColumns = (person: PersonInput) =>
	({
		name: person.name,
		weight: person.weight,
		height: person.height,
		age: person.age,
		gender: person.gender,
		poles: person.poles,
		backProtection: person.backProtection,
		skiCover: person.skiCover,
		bootCover: person.bootCover,
		goggles: person.goggles,
		level: person.level,
		note: person.note,
	}) satisfies Prisma.PersonCreateWithoutReservationInput &
		Prisma.PersonUpdateWithoutReservationInput
