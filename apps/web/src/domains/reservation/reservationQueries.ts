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

/**
 * A step on an item, a person or a reservation also moves the person's and the reservation's
 * rolled-up status, so the open detail and the list's badge are both stale.
 * No success toast: the badge changing is the feedback, and the prep counter
 * clicks these dozens of times in a row.
 */
const invalidateAfterStep = () => {
	invalidateReservationList()
	queryClient.invalidateQueries({ queryKey: trpc.reservation.get.queryKey() })
}

export const useAdvanceReservationItem = () =>
	useMutation(
		trpc.reservationItem.advance.mutationOptions({
			onSuccess: invalidateAfterStep,
			// a CONFLICT means the page was stale; refetch so it shows the truth
			onError: (error) => {
				invalidateAfterStep()
				notifyError(error.message, 'Položku se nepodařilo posunout.')
			},
		})
	)

export const useUndoReservationItem = () =>
	useMutation(
		trpc.reservationItem.undo.mutationOptions({
			onSuccess: invalidateAfterStep,
			onError: (error) => {
				invalidateAfterStep()
				notifyError(error.message, 'Krok se nepodařilo vrátit.')
			},
		})
	)

export const useAdvancePerson = () =>
	useMutation(
		trpc.person.advance.mutationOptions({
			onSuccess: invalidateAfterStep,
			onError: (error) => {
				invalidateAfterStep()
				notifyError(error.message, 'Osobu se nepodařilo posunout.')
			},
		})
	)

export const useAdvanceReservation = () =>
	useMutation(
		trpc.reservation.advance.mutationOptions({
			onSuccess: invalidateAfterStep,
			onError: (error) => {
				invalidateAfterStep()
				notifyError(error.message, 'Rezervaci se nepodařilo posunout.')
			},
		})
	)
