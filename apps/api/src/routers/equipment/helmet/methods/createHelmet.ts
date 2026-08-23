import { prisma } from '@ski-blazek/db'
import type { CreateHelmetInput } from '../../../../schemas/helmet'
import {
	asArticleNumberConflict,
	assignLowestFreeNumber,
} from '../../_shared/lib/assignArticleNumber'

export const createHelmet = async (input: CreateHelmetInput) => {
	try {
		return await prisma.helmet.create({
			data: {
				...input,
				equipmentItem: {
					create: {
						type: 'HELMET',
						articleGroup: null,
						articleNumber: await assignLowestFreeNumber(prisma, 'HELMET', null),
					},
				},
			},
			include: { equipmentItem: true },
		})
	} catch (error) {
		throw asArticleNumberConflict(error)
	}
}
