import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'

export const cancelPerson = async ({ id }: { id: string }) => {
	const person = await prisma.person.findUnique({
		where: {
			id,
		},
	})

	if (!person) throw new TRPCError({ code: 'NOT_FOUND', message: 'Osoba nebyla nalezena' })

	// Cancelled is final, and a repeat (double click, retry) must not move the
	// date they were cancelled on.
	if (person.status === 'CANCELLED') return person

	return await prisma.person.update({
		where: { id },
		data: {
			status: 'CANCELLED',
			cancelledAt: new Date(),
			reservationItems: {
				updateMany: {
					// already-cancelled items keep the date they were cancelled on
					where: { status: { not: 'CANCELLED' } },
					data: {
						status: 'CANCELLED',
						cancelledAt: new Date(),
					},
				},
			},
		},
	})
}
