import { useMutation } from '@tanstack/react-query'
import { notifyError, notifySuccess } from '~/lib/notify'
import { queryClient, trpc } from '~/lib/trpc'

/** Invalidate every cached `getSnowboard` list so it refetches after a mutation. */
const invalidateSnowboardList = () =>
  queryClient.invalidateQueries({
    queryKey: trpc.equipment.snowboard.list.queryKey(),
  })

/* ---------------------------- Mutations ---------------------------- */

export const useCreateSnowboard = () =>
  useMutation(
    trpc.equipment.snowboard.create.mutationOptions({
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
    trpc.equipment.snowboard.update.mutationOptions({
      onSuccess: () => {
        invalidateSnowboardList()
        notifySuccess('Snowboard upraven', 'Snowboard byl úspěšně upraven.')
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se upravit snowboard.'),
    })
  )
