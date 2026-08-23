import { prisma } from '@ski-blazek/db'
import type { CreateSnowboardBootInput } from '../../../../schemas/snowboardBoot'
import {
	articleGroupForBootLength,
	asArticleNumberConflict,
	assignLowestFreeNumber,
} from '../../_shared/lib/assignArticleNumber'

export const createSnowboardBoot = async (input: CreateSnowboardBootInput) => {
	const articleGroup = articleGroupForBootLength(input.length)

	try {
		return await prisma.snowboardBoot.create({
			data: {
				...input,
				equipmentItem: {
					create: {
						type: 'SNOWBOARD_BOOT',
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
