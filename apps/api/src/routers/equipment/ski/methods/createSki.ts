import { prisma } from '@ski-blazek/db'
import type { CreateSkiInput } from '../../../../schemas/ski'
import {
	asArticleNumberConflict,
	assignLowestFreeNumber,
} from '../../_shared/lib/assignArticleNumber'

export const createSki = async (input: CreateSkiInput) => {
	try {
		return await prisma.ski.create({
			data: {
				...input,
				equipmentItem: {
					create: {
						type: 'SKI',
						// Skis carry a plain running number, so they sit in the null pool.
						articleGroup: null,
						articleNumber: await assignLowestFreeNumber(prisma, 'SKI', null),
					},
				},
			},
			include: { equipmentItem: true },
		})
	} catch (error) {
		throw asArticleNumberConflict(error)
	}
}
