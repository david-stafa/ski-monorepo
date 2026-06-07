import { useMutation } from '@tanstack/react-query'
import { notifyError, notifySuccess } from '~/lib/notify'
import { queryClient, trpc } from '~/lib/trpc'

/** Invalidate every cached `getSnowboard` list so it refetches after a mutation. */
const invalidateSnowboardList = () =>
  queryClient.invalidateQueries({
    queryKey: trpc.equipment.snowboard.getSnowboard.queryKey(),
  })

/* ---------------------------- Mutations ---------------------------- */

export const useCreateSnowboard = () =>
  useMutation(
    trpc.equipment.snowboard.createSnowboard.mutationOptions({
      onSuccess: () => {
        invalidateSnowboardList()
        notifySuccess('Snowboard přidán', 'Snowboard byl úspěšně vytvořen.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se vytvořit snowboard.'),
    })
  )

export const useUpdateSnowboard = () =>
  useMutation(
    trpc.equipment.snowboard.updateSnowboard.mutationOptions({
      onSuccess: () => {
        invalidateSnowboardList()
        notifySuccess('Snowboard upraven', 'Snowboard byl úspěšně upraven.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se upravit snowboard.'),
    })
  )

export const useDeleteSnowboard = () =>
  useMutation(
    trpc.equipment.snowboard.deleteSnowboard.mutationOptions({
      onSuccess: () => {
        invalidateSnowboardList()
        notifySuccess('Snowboard smazán', 'Snowboard byl úspěšně smazán.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se smazat snowboard.'),
    })
  )
