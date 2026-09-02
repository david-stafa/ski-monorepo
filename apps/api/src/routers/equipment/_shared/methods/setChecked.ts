import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import type { SetCheckedInput } from '../../../../schemas/stockCheck'

/**
 * Tick / untick one item during the stock check. Unticking writes null rather
 * than an old date — it's the mistake-correction path, not a second state.
 */
export const setChecked = async ({ id, checked }: SetCheckedInput) => {
	const item = await prisma.equipmentItem.findUnique({ where: { id } })

	if (!item) throw new TRPCError({ code: 'NOT_FOUND' })

	return await prisma.equipmentItem.update({
		where: { id },
		data: { lastCheckedAt: checked ? new Date() : null },
	})
}
