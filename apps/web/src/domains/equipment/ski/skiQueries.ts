import { useMutation } from '@tanstack/react-query'
import { notifyError, notifySuccess } from '~/lib/notify'
import { queryClient, trpc } from '~/lib/trpc'

/** Invalidate every cached `getSki` list so it refetches after a mutation. */
const invalidateSkiList = () =>
  queryClient.invalidateQueries({
    queryKey: trpc.equipment.ski.getSki.queryKey(),
  })

/* ---------------------------- Mutations ---------------------------- */

export const useCreateSki = () =>
  useMutation(
    trpc.equipment.ski.createSki.mutationOptions({
      onSuccess: () => {
        invalidateSkiList()
        notifySuccess('Lyže přidány', 'Lyže byly úspěšně vytvořeny.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se vytvořit lyže.'),
    })
  )

export const useUpdateSki = () =>
  useMutation(
    trpc.equipment.ski.updateSki.mutationOptions({
      onSuccess: () => {
        invalidateSkiList()
        notifySuccess('Lyže upraveny', 'Lyže byly úspěšně upraveny.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se upravit lyže.'),
    })
  )
