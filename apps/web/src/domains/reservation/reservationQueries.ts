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
				notifySuccess('Rezervace vytvořena', 'Rezervace byla úspěšně vytvořena.')
			},
			onError: (error) => notifyError(error.message, 'Nepodařilo se vytvořit rezervaci.'),
		})
	)

export const useUpdateReservation = () =>
	useMutation(
		trpc.reservation.update.mutationOptions({
			onSuccess: (_result, variables) => {
				invalidateReservationList()
				// the edit form reads getForEdit and the pick-up sheet reads get —
				// both are stale the moment an update lands
				queryClient.invalidateQueries({
					queryKey: trpc.reservation.getForEdit.queryKey({ id: variables.id }),
				})
				queryClient.invalidateQueries({
					queryKey: trpc.reservation.get.queryKey({ id: variables.id }),
				})
				notifySuccess('Rezervace upravena', 'Rezervace byla úspěšně upravena.')
			},
			onError: (error) => notifyError(error.message, 'Nepodařilo se upravit rezervaci.'),
		})
	)

export const useCancelReservation = () =>
	useMutation(
		trpc.reservation.cancel.mutationOptions({
			onSuccess: () => {
				invalidateReservationList()
				notifySuccess('Rezervace zrušena', 'Rezervace byla úspěšně zrušena.')
			},
			onError: (error) => notifyError(error.message, 'Nepodařilo se zrušit rezervaci.'),
		})
	)
