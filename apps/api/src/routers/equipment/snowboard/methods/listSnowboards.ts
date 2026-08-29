import { prisma } from '@ski-blazek/db'
import type { Prisma } from '@ski-blazek/db/browser'
import type { GetSnowboardInput } from '../../../../schemas/snowboard'
import {
	articleNumberOrderBy,
	articleNumberSearchFilter,
	wholeNumberSearch,
} from '../../_shared/lib/equipmentListQuery'

export const listSnowboards = async ({
	page,
	itemsPerPage,
	orderBy,
	orderDirection,
	search,
}: GetSnowboardInput) => {
	const where: Prisma.SnowboardWhereInput = search
		? {
				OR: [
					{ brand: { contains: search, mode: 'insensitive' } },
					{ model: { contains: search, mode: 'insensitive' } },
					{ length: { equals: wholeNumberSearch(search) } },
					...articleNumberSearchFilter(search),
				],
			}
		: {}

	const orderByClause: Prisma.SnowboardOrderByWithRelationInput[] =
		orderBy === 'articleNumber'
			? articleNumberOrderBy(orderDirection)
			: [{ [orderBy]: orderDirection }]

	const [snowboards, totalCount] = await prisma.$transaction([
		prisma.snowboard.findMany({
			where,
			select: {
				id: true,
				brand: true,
				model: true,
				length: true,
				gender: true,
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

		prisma.snowboard.count({
			where,
		}),
	])

	return {
		snowboards,
		totalCount,
	}
}
