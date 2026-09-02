import { EquipmentItemType } from '@ski-blazek/db/browser'
import { useMutation } from '@tanstack/react-query'
import type { TRPCQueryKeyWithoutPrefix } from '@trpc/tanstack-react-query'
import { notifyError, notifySuccess } from '~/lib/notify'
import { queryClient, trpc } from '~/lib/trpc'

type EquipmentAction = 'delete' | 'retire' | 'unretire' | 'archiveUnchecked'

interface EquipmentMeta {
	/** List query to invalidate after a mutation for this equipment type. */
	invalidate: TRPCQueryKeyWithoutPrefix
	messages: Record<EquipmentAction, { success: string; error: string }>
	/**
	 * Ticking a row during the stock check saves in the background and has no
	 * success toast — a toast per row would bury the screen — so only the
	 * failure message is needed.
	 */
	checkError: string
}

/**
 * Single source of truth per equipment type: which list to invalidate and the
 * localized toast messages for each mutation. Typed as `Record<EquipmentItemType, …>`
 * so adding a new equipment type is a compile error until it is filled in here.
 */
const EQUIPMENT_META: Record<EquipmentItemType, EquipmentMeta> = {
	[EquipmentItemType.SKI]: {
		invalidate: trpc.equipment.ski.list.pathKey(),
		messages: {
			delete: {
				success: 'Lyže byly úspěšně smazány.',
				error: 'Nepodařilo se smazat lyže.',
			},
			retire: {
				success: 'Lyže byly úspěšně archivovány.',
				error: 'Nepodařilo se archivovat lyže.',
			},
			unretire: {
				success: 'Lyže byly úspěšně aktivovány.',
				error: 'Nepodařilo se aktivovat lyže.',
			},
			archiveUnchecked: {
				success: 'Nezkontrolované lyže byly archivovány.',
				error: 'Nepodařilo se archivovat nezkontrolované lyže.',
			},
		},
		checkError: 'Nepodařilo se změnit stav kontroly lyží.',
	},
	[EquipmentItemType.SKI_BOOT]: {
		invalidate: trpc.equipment.skiBoot.list.pathKey(),
		messages: {
			delete: {
				success: 'Lyžařské boty byly úspěšně smazány.',
				error: 'Nepodařilo se smazat lyžařské boty.',
			},
			retire: {
				success: 'Lyžařské boty byly úspěšně archivovány.',
				error: 'Nepodařilo se archivovat lyžařské boty.',
			},
			unretire: {
				success: 'Lyžařské boty byly úspěšně aktivovány.',
				error: 'Nepodařilo se aktivovat lyžařské boty.',
			},
			archiveUnchecked: {
				success: 'Nezkontrolované lyžařské boty byly archivovány.',
				error: 'Nepodařilo se archivovat nezkontrolované lyžařské boty.',
			},
		},
		checkError: 'Nepodařilo se změnit stav kontroly lyžařských bot.',
	},
	[EquipmentItemType.SNOWBOARD]: {
		invalidate: trpc.equipment.snowboard.list.pathKey(),
		messages: {
			delete: {
				success: 'Snowboard byl úspěšně smazán.',
				error: 'Nepodařilo se smazat snowboard.',
			},
			retire: {
				success: 'Snowboard byl úspěšně archivován.',
				error: 'Nepodařilo se archivovat snowboard.',
			},
			unretire: {
				success: 'Snowboard byl úspěšně aktivován.',
				error: 'Nepodařilo se aktivovat snowboard.',
			},
			archiveUnchecked: {
				success: 'Nezkontrolované snowboardy byly archivovány.',
				error: 'Nepodařilo se archivovat nezkontrolované snowboardy.',
			},
		},
		checkError: 'Nepodařilo se změnit stav kontroly snowboardu.',
	},
	[EquipmentItemType.SNOWBOARD_BOOT]: {
		invalidate: trpc.equipment.snowboardBoot.list.pathKey(),
		messages: {
			delete: {
				success: 'Snowboardové boty byly úspěšně smazány.',
				error: 'Nepodařilo se smazat snowboardové boty.',
			},
			retire: {
				success: 'Snowboardové boty byly úspěšně archivovány.',
				error: 'Nepodařilo se archivovat snowboardové boty.',
			},
			unretire: {
				success: 'Snowboardové boty byly úspěšně aktivovány.',
				error: 'Nepodařilo se aktivovat snowboardové boty.',
			},
			archiveUnchecked: {
				success: 'Nezkontrolované snowboardové boty byly archivovány.',
				error: 'Nepodařilo se archivovat nezkontrolované snowboardové boty.',
			},
		},
		checkError: 'Nepodařilo se změnit stav kontroly snowboardových bot.',
	},
	[EquipmentItemType.HELMET]: {
		invalidate: trpc.equipment.helmet.list.pathKey(),
		messages: {
			delete: {
				success: 'Helma byla úspěšně smazána.',
				error: 'Nepodařilo se smazat helmu.',
			},
			retire: {
				success: 'Helma byla úspěšně archivována.',
				error: 'Nepodařilo se archivovat helmu.',
			},
			unretire: {
				success: 'Helma byla úspěšně aktivována.',
				error: 'Nepodařilo se aktivovat helmu.',
			},
			archiveUnchecked: {
				success: 'Nezkontrolované helmy byly archivovány.',
				error: 'Nepodařilo se archivovat nezkontrolované helmy.',
			},
		},
		checkError: 'Nepodařilo se změnit stav kontroly helmy.',
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

export const useUnretireItem = (type: EquipmentItemType) => {
	const { invalidate, messages } = EQUIPMENT_META[type]

	return useMutation(
		trpc.equipment.equipmentItem.unretire.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: invalidate })
				notifySuccess('Aktivováno', messages.unretire.success)
			},
			onError: (error) => notifyError(error.message, messages.unretire.error),
		})
	)
}

/**
 * Ticking one item off during the stock check. No success toast — a toast per
 * row would bury the screen during an inventura — so the list invalidation is
 * the only feedback, plus the row turning green.
 */
export const useSetChecked = (type: EquipmentItemType) => {
	const { invalidate, checkError } = EQUIPMENT_META[type]

	return useMutation(
		trpc.equipment.equipmentItem.setChecked.mutationOptions({
			onSuccess: () => queryClient.invalidateQueries({ queryKey: invalidate }),
			onError: (error) => notifyError(error.message, checkError),
		})
	)
}

/** Closing the stock check: archive everything of this type that never turned up. */
export const useArchiveUnchecked = (type: EquipmentItemType) => {
	const { invalidate, messages } = EQUIPMENT_META[type]

	return useMutation(
		trpc.equipment.equipmentItem.archiveUnchecked.mutationOptions({
			onSuccess: ({ count }) => {
				queryClient.invalidateQueries({ queryKey: invalidate })
				queryClient.invalidateQueries({
					queryKey: trpc.equipment.equipmentItem.previewStockSweep.pathKey(),
				})
				notifySuccess(`Archivováno: ${count}`, messages.archiveUnchecked.success)
			},
			onError: (error) => notifyError(error.message, messages.archiveUnchecked.error),
		})
	)
}
