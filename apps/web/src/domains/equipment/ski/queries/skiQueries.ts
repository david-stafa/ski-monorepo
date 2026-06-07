import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryClient, trpc } from '~/lib/trpc'

/** Invalidate every cached `getSki` list so it refetches after a mutation. */
const invalidateSkiList = () =>
  queryClient.invalidateQueries({
    queryKey: trpc.equipment.ski.getSki.queryKey(),
  })

const notifyError = (message: string, description: string) =>
  toast.error(message, { description, position: 'top-right' })

const notifySuccess = (message: string, description: string) =>
  toast.success(message, { description, position: 'top-right' })

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

export const useDeleteSki = () =>
  useMutation(
    trpc.equipment.ski.deleteSki.mutationOptions({
      onSuccess: () => {
        invalidateSkiList()
        notifySuccess('Lyže smazána', 'Lyže byla úspěšně smazána.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se smazat lyži.'),
    })
  )
