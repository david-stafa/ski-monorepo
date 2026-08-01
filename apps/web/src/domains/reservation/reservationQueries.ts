import { useMutation } from '@tanstack/react-query'
import { notifyError, notifySuccess } from '~/lib/notify'
import { queryClient, trpc } from '~/lib/trpc'

/** Invalidate every cached reservation list so it refetches after a mutation. */
const invalidateReservationList = () =>
  queryClient.invalidateQueries({
    queryKey: trpc.reservation.list.queryKey(),
  })

/* ---------------------------- Mutations ---------------------------- */

export const useCreateReservation = () =>
  useMutation(
    trpc.reservation.create.mutationOptions({
      onSuccess: () => {
        invalidateReservationList()
        notifySuccess(
          'Rezervace vytvořena',
          'Rezervace byla úspěšně vytvořena.'
        )
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se vytvořit rezervaci.'),
    })
  )
