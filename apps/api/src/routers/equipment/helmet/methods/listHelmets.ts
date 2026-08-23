import { prisma } from '@ski-blazek/db'
import type { Prisma } from '@ski-blazek/db/browser'
import type { GetHelmetInput } from '../../../../schemas/helmet'
import {
	articleNumberOrderBy,
	articleNumberSearchFilter,
} from '../../_shared/lib/equipmentListQuery'

export const listHelmets = async ({
	page,
	itemsPerPage,
	orderBy,
	orderDirection,
	search,
}: GetHelmetInput) => {
	const where: Prisma.HelmetWhereInput = search
		? {
				OR: [
					{ name: { contains: search, mode: 'insensitive' } },
					{ color: { contains: search, mode: 'insensitive' } },
					...articleNumberSearchFilter(search),
				],
			}
		: {}

	const orderByClause: Prisma.HelmetOrderByWithRelationInput[] =
		orderBy === 'articleNumber'
			? articleNumberOrderBy(orderDirection)
			: [{ [orderBy]: orderDirection }]

	const [helmets, totalCount] = await prisma.$transaction([
		prisma.helmet.findMany({
			where,
			select: {
				id: true,
				name: true,
				size: true,
				color: true,
				description: true,
				withIntegratedGoggles: true,
				equipmentItemId: true,
				equipmentItem: {
					select: {
						retiredAt: true,
						articleGroup: true,
						articleNumber: true,
					},
				},
			},
			skip: (page - 1) * itemsPerPage,
			take: itemsPerPage,
			orderBy: orderByClause,
		}),

		prisma.helmet.count({
			where,
		}),
	])

	return {
		helmets,
		totalCount,
	}
}
