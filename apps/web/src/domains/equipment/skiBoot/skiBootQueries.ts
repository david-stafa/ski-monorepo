import { useMutation } from '@tanstack/react-query'
import { notifyError, notifySuccess } from '~/lib/notify'
import { queryClient, trpc } from '~/lib/trpc'

/** Invalidate every cached `getSki` list so it refetches after a mutation. */
const invalidateSkiBootList = () =>
  queryClient.invalidateQueries({
    queryKey: trpc.equipment.skiBoot.list.queryKey(),
  })

/* ---------------------------- Mutations ---------------------------- */

export const useCreateSkiBoot = () =>
  useMutation(
    trpc.equipment.skiBoot.create.mutationOptions({
      onSuccess: () => {
        invalidateSkiBootList()
        notifySuccess('Lyžařská bot přidána', 'Lyžařská bot byla úspěšně vytvořena.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se vytvořit lyžařskou botu.'),
    })
  )

export const useUpdateSkiBoot = () =>
  useMutation(
    trpc.equipment.skiBoot.update.mutationOptions({
      onSuccess: () => {
        invalidateSkiBootList()
        notifySuccess('Lyžařská bot upravena', 'Lyžařská bot byla úspěšně upravena.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se upravit lyžařskou botu.'),
    })
  )
