import { EquipmentItemType } from '@ski-blazek/db/browser'
import { z } from 'zod'
import { seasonStart } from './season'

/*
    The annual stock check (inventura). Shared by the API and the web app, so
    the green rows in the table and the items the sweep archives are decided by
    the same rule — see `apps/api/src/schemas/index.ts` for why this file is a
    schema module rather than a server lib.
 */

/** Has this item been seen in the current season's check? */
export const isChecked = (lastCheckedAt: Date | null) =>
	lastCheckedAt !== null && lastCheckedAt >= seasonStart()

/** Inventory-mode list filter. Merged into every equipment list schema. */
export const stockCheckFilterSchema = z.object({
	checkedFilter: z.enum(['all', 'checked', 'unchecked']).default('all'),
})
export type CheckedFilter = z.infer<typeof stockCheckFilterSchema>['checkedFilter']

/** Toggling a single item from the table checkbox. */
export const setCheckedInputSchema = z.object({
	id: z.string(),
	checked: z.boolean(),
})
export type SetCheckedInput = z.infer<typeof setCheckedInputSchema>

/** Preview / run the sweep for one equipment type. */
export const stockSweepInputSchema = z.object({
	type: z.enum(EquipmentItemType),
})
export type StockSweepInput = z.infer<typeof stockSweepInputSchema>
