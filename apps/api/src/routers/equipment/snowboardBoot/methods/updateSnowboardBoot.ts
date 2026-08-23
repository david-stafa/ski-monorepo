import { prisma } from '@ski-blazek/db'
import { TRPCError } from '@trpc/server'
import type { UpdateSnowboardBootInput } from '../../../../schemas/snowboardBoot'
import {
	articleGroupForBootLength,
	asArticleNumberConflict,
	assignLowestFreeNumber,
} from '../../_shared/lib/assignArticleNumber'

export const updateSnowboardBoot = async ({ id, ...data }: UpdateSnowboardBootInput) => {
	const snowboardBoot = await prisma.snowboardBoot.findUnique({
		where: { id },
		select: { equipmentItem: { select: { articleGroup: true } } },
	})

	if (!snowboardBoot) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Snowboard boot not found',
		})
	}

	const articleGroup = articleGroupForBootLength(data.length)

	if (articleGroup === snowboardBoot.equipmentItem.articleGroup) {
		return await prisma.snowboardBoot.update({
			where: { id },
			data,
			include: { equipmentItem: true },
		})
	}

	// Re-sizing moves the boot to another sticker pool, where its old sequence
	// means nothing. It takes the lowest free number there and releases the old
	// one; the caller reads the new number off the response so staff can rewrite
	// the sticker.
	try {
		return await prisma.snowboardBoot.update({
			where: { id },
			data: {
				...data,
				equipmentItem: {
					update: {
						articleGroup,
						articleNumber: await assignLowestFreeNumber(prisma, 'SNOWBOARD_BOOT', articleGroup),
					},
				},
			},
			include: { equipmentItem: true },
		})
	} catch (error) {
		throw asArticleNumberConflict(error)
	}
}
