import { useMutation } from '@tanstack/react-query'
import { notifyError, notifySuccess } from '~/lib/notify'
import { queryClient, trpc } from '~/lib/trpc'

/** Invalidate every cached `getHelmet` list so it refetches after a mutation. */
const invalidateHelmetList = () =>
  queryClient.invalidateQueries({
    queryKey: trpc.equipment.helmet.getHelmet.queryKey(),
  })

/* ---------------------------- Mutations ---------------------------- */

export const useCreateHelmet = () =>
  useMutation(
    trpc.equipment.helmet.createHelmet.mutationOptions({
      onSuccess: () => {
        invalidateHelmetList()
        notifySuccess('Helma přidána', 'Helma byla úspěšně vytvořena.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se vytvořit helmu.'),
    })
  )

export const useUpdateHelmet = () =>
  useMutation(
    trpc.equipment.helmet.updateHelmet.mutationOptions({
      onSuccess: () => {
        invalidateHelmetList()
        notifySuccess('Helma upravena', 'Helma byla úspěšně upravena.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se upravit helmu.'),
    })
  )

export const useDeleteHelmet = () =>
  useMutation(
    trpc.equipment.helmet.deleteHelmet.mutationOptions({
      onSuccess: () => {
        invalidateHelmetList()
        notifySuccess('Helma smazána', 'Helma byla úspěšně smazána.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se smazat helmu.'),
    })
  )
