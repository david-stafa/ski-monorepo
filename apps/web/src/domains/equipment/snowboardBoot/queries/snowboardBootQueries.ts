import { useMutation } from '@tanstack/react-query'
import { notifyError, notifySuccess } from '~/lib/notify'
import { queryClient, trpc } from '~/lib/trpc'

/** Invalidate every cached `getSnowboardBoot` list so it refetches after a mutation. */
const invalidateSnowboardBootList = () =>
  queryClient.invalidateQueries({
    queryKey: trpc.equipment.snowboardBoot.getSnowboardBoot.queryKey(),
  })

/* ---------------------------- Mutations ---------------------------- */

export const useCreateSnowboardBoot = () =>
  useMutation(
    trpc.equipment.snowboardBoot.createSnowboardBoot.mutationOptions({
      onSuccess: () => {
        invalidateSnowboardBootList()
        notifySuccess(
          'Snowboardová bota přidána',
          'Snowboardová bota byla úspěšně vytvořena.'
        )
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se vytvořit snowboardovou botu.'),
    })
  )

export const useUpdateSnowboardBoot = () =>
  useMutation(
    trpc.equipment.snowboardBoot.updateSnowboardBoot.mutationOptions({
      onSuccess: () => {
        invalidateSnowboardBootList()
        notifySuccess(
          'Snowboardová bota upravena',
          'Snowboardová bota byla úspěšně upravena.'
        )
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se upravit snowboardovou botu.'),
    })
  )

export const useDeleteSnowboardBoot = () =>
  useMutation(
    trpc.equipment.snowboardBoot.deleteSnowboardBoot.mutationOptions({
      onSuccess: () => {
        invalidateSnowboardBootList()
        notifySuccess(
          'Snowboardová bota smazána',
          'Snowboardová bota byla úspěšně smazána.'
        )
      },
      onError: (error) =>
        notifyError(error.message, 'Nepodařilo se smazat snowboardovou botu.'),
    })
  )
