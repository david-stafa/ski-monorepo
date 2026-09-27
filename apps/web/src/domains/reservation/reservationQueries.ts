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
				invalidateAfterStatusChange()
				notifySuccess('Rezervace zrušena', 'Rezervace byla úspěšně zrušena.')
			},
			// a CONFLICT means gear was handed out meanwhile; refetch so the list
			// stops offering the cancel
			onError: (error) => {
				invalidateAfterStatusChange()
				notifyError(error.message, 'Nepodařilo se zrušit rezervaci.')
			},
		})
	)

/**
 * A step or a cancel on an item, a person or a reservation also moves the
 * person's and the reservation's rolled-up status, so the open detail, the
 * list's badge and the edit form are all stale.
 * No success toast: the badge changing is the feedback, and the prep counter
 * clicks these dozens of times in a row.
 */
const invalidateAfterStatusChange = () => {
	invalidateReservationList()
	queryClient.invalidateQueries({ queryKey: trpc.reservation.get.queryKey() })
	// the edit form locks gear by status, so it must not open from a stale copy
	queryClient.invalidateQueries({ queryKey: trpc.reservation.getForEdit.queryKey() })
}

export const useAdvanceReservationItem = () =>
	useMutation(
		trpc.reservationItem.advance.mutationOptions({
			onSuccess: invalidateAfterStatusChange,
			// a CONFLICT means the page was stale; refetch so it shows the truth
			onError: (error) => {
				invalidateAfterStatusChange()
				notifyError(error.message, 'Položku se nepodařilo posunout.')
			},
		})
	)

export const useUndoReservationItem = () =>
	useMutation(
		trpc.reservationItem.undo.mutationOptions({
			onSuccess: invalidateAfterStatusChange,
			onError: (error) => {
				invalidateAfterStatusChange()
				notifyError(error.message, 'Krok se nepodařilo vrátit.')
			},
		})
	)

export const useAdvancePerson = () =>
	useMutation(
		trpc.person.advance.mutationOptions({
			onSuccess: invalidateAfterStatusChange,
			onError: (error) => {
				invalidateAfterStatusChange()
				notifyError(error.message, 'Osobu se nepodařilo posunout.')
			},
		})
	)

/** Only for a person with no items, whom staff move by hand. */
export const useUndoPerson = () =>
	useMutation(
		trpc.person.undo.mutationOptions({
			onSuccess: invalidateAfterStatusChange,
			onError: (error) => {
				invalidateAfterStatusChange()
				notifyError(error.message, 'Krok se nepodařilo vrátit.')
			},
		})
	)

export const useAdvanceReservation = () =>
	useMutation(
		trpc.reservation.advance.mutationOptions({
			onSuccess: invalidateAfterStatusChange,
			onError: (error) => {
				invalidateAfterStatusChange()
				notifyError(error.message, 'Rezervaci se nepodařilo posunout.')
			},
		})
	)

/** Refreshes the same as a step: the person drops off the open detail, and
 * the reservation's rolled-up status may move on without them. */
export const useCancelPerson = () =>
	useMutation(
		trpc.person.cancel.mutationOptions({
			onSuccess: () => {
				invalidateAfterStatusChange()
				notifySuccess('Osoba zrušena', 'Osoba byla úspěšně zrušena.')
			},
			// a CONFLICT means gear was handed out meanwhile; refetch so it shows
			onError: (error) => {
				invalidateAfterStatusChange()
				notifyError(error.message, 'Osobu se nepodařilo zrušit.')
			},
		})
	)
