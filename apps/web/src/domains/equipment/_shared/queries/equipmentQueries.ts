import { EquipmentItemType } from '@ski-blazek/db/browser'
import { useMutation } from '@tanstack/react-query'
import type { TRPCQueryKeyWithoutPrefix } from '@trpc/tanstack-react-query'
import { notifyError, notifySuccess } from '~/lib/notify'
import { queryClient, trpc } from '~/lib/trpc'

type EquipmentAction = 'delete' | 'retire'

interface EquipmentMeta {
  /** List query to invalidate after a mutation for this equipment type. */
  invalidate: TRPCQueryKeyWithoutPrefix
  messages: Record<EquipmentAction, { success: string; error: string }>
}

/**
 * Single source of truth per equipment type: which list to invalidate and the
 * localized toast messages for each mutation. Typed as `Record<EquipmentItemType, …>`
 * so adding a new equipment type is a compile error until it is filled in here.
 */
const EQUIPMENT_META: Record<EquipmentItemType, EquipmentMeta> = {
  [EquipmentItemType.SKI]: {
    invalidate: trpc.equipment.ski.getSki.pathKey(),
    messages: {
      delete: {
        success: 'Lyže byly úspěšně smazány.',
        error: 'Nepodařilo se smazat lyže.',
      },
      retire: {
        success: 'Lyže byly úspěšně archivovány.',
        error: 'Nepodařilo se archivovat lyže.',
      },
    },
  },
  [EquipmentItemType.SKI_BOOT]: {
    invalidate: trpc.equipment.skiBoot.getSkiBoot.pathKey(),
    messages: {
      delete: {
        success: 'Lyžařské boty byly úspěšně smazány.',
        error: 'Nepodařilo se smazat lyžařské boty.',
      },
      retire: {
        success: 'Lyžařské boty byly úspěšně archivovány.',
        error: 'Nepodařilo se archivovat lyžařské boty.',
      },
    },
  },
  [EquipmentItemType.SNOWBOARD]: {
    invalidate: trpc.equipment.snowboard.getSnowboard.pathKey(),
    messages: {
      delete: {
        success: 'Snowboard byl úspěšně smazán.',
        error: 'Nepodařilo se smazat snowboard.',
      },
      retire: {
        success: 'Snowboard byl úspěšně archivován.',
        error: 'Nepodařilo se archivovat snowboard.',
      },
    },
  },
  [EquipmentItemType.SNOWBOARD_BOOT]: {
    invalidate: trpc.equipment.snowboardBoot.getSnowboardBoot.pathKey(),
    messages: {
      delete: {
        success: 'Snowboardové boty byly úspěšně smazány.',
        error: 'Nepodařilo se smazat snowboardové boty.',
      },
      retire: {
        success: 'Snowboardové boty byly úspěšně archivovány.',
        error: 'Nepodařilo se archivovat snowboardové boty.',
      },
    },
  },
  [EquipmentItemType.HELMET]: {
    invalidate: trpc.equipment.helmet.getHelmet.pathKey(),
    messages: {
      delete: {
        success: 'Helma byla úspěšně smazána.',
        error: 'Nepodařilo se smazat helmu.',
      },
      retire: {
        success: 'Helma byla úspěšně archivována.',
        error: 'Nepodařilo se archivovat helmu.',
      },
    },
  },
}

export const useDeleteItem = (type: EquipmentItemType) => {
  const { invalidate, messages } = EQUIPMENT_META[type]

  return useMutation(
    trpc.equipment.equipmentItem.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: invalidate })
        notifySuccess('Smazáno', messages.delete.success)
      },
      onError: (error) => notifyError(error.message, messages.delete.error),
    })
  )
}

export const useRetireItem = (type: EquipmentItemType) => {
  const { invalidate, messages } = EQUIPMENT_META[type]

  return useMutation(
    trpc.equipment.equipmentItem.retire.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: invalidate })
        notifySuccess('Archivováno', messages.retire.success)
      },
      onError: (error) => notifyError(error.message, messages.retire.error),
    })
  )
}
