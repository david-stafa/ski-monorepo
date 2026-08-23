import { prisma } from '@ski-blazek/db'
import type { CreateSnowboardInput } from '../../../../schemas/snowboard'
import {
	asArticleNumberConflict,
	assignLowestFreeNumber,
} from '../../_shared/lib/assignArticleNumber'

export const createSnowboard = async (input: CreateSnowboardInput) => {
	try {
		return await prisma.snowboard.create({
			data: {
				...input,
				equipmentItem: {
					create: {
						type: 'SNOWBOARD',
						articleGroup: null,
						articleNumber: await assignLowestFreeNumber(prisma, 'SNOWBOARD', null),
					},
				},
			},
			include: { equipmentItem: true },
		})
	} catch (error) {
		throw asArticleNumberConflict(error)
	}
}
