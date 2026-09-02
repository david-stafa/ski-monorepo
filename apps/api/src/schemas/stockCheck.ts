import { EquipmentItemType } from '@ski-blazek/db/browser'
import { z } from 'zod'

/*
    The annual stock check (inventura). Shared by the API and the web app, so
    the green rows in the table and the items the sweep archives are decided by
    the same rule — see `apps/api/src/schemas/index.ts` for why this file is a
    schema module rather than a server lib.
 */

/**
 * The season rolls over on 1 October (zero-based month). Change this one
 * constant and both the "checked this year" highlight and the sweep follow.
 */
const SEASON_START_MONTH = 9

/**
 * Start of the season `at` falls in. A check recorded on or after this counts
 * as current; anything older is last season's and the sweep will pick it up.
 *
 * Deliberately not `now - 1 year`: a rolling window gives a different answer
 * depending on the hour you click, and drifts if a check spans New Year.
 */
export const seasonStart = (at: Date = new Date()) => {
	const year = at.getMonth() >= SEASON_START_MONTH ? at.getFullYear() : at.getFullYear() - 1

	return new Date(year, SEASON_START_MONTH, 1)
}

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
