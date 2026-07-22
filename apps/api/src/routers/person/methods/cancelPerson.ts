import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'

export const cancelPerson = async ({ id }: { id: string }) => {
  const person = await prisma.person.findUnique({
    where: {
      id,
    },
  })

  if (!person)
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Osoba nebyla nalezena' })

  return await prisma.person.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      reservationItems: {
        updateMany: {
          where: {},
          data: {
            status: 'CANCELLED',
          },
        },
      },
    },
  })
}
