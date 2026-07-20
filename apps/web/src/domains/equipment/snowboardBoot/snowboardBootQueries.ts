import { useMutation } from '@tanstack/react-query'
import { notifyError, notifySuccess } from '~/lib/notify'
import { queryClient, trpc } from '~/lib/trpc'

/** Invalidate every cached `getSnowboardBoot` list so it refetches after a mutation. */
const invalidateSnowboardBootList = () =>
  queryClient.invalidateQueries({
    queryKey: trpc.equipment.snowboardBoot.list.queryKey(),
  })

/* ---------------------------- Mutations ---------------------------- */

export const useCreateSnowboardBoot = () =>
  useMutation(
    trpc.equipment.snowboardBoot.create.mutationOptions({
      onSuccess: () => {
        invalidateSnowboardBootList()
        notifySuccess(
          'Snowboardová bota přidána',
          'Snowboardová bota byla úspěšně vytvořena.'
        )
      },
      onError: (error) =>
        notifyError(
          error.message,
          'Nepodařilo se vytvořit snowboardovou botu.'
        ),
    })
  )

export const useUpdateSnowboardBoot = () =>
  useMutation(
    trpc.equipment.snowboardBoot.update.mutationOptions({
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
