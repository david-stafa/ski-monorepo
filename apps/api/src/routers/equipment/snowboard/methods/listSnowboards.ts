import { prisma } from '@ski-blazek/db'
import type { Prisma } from '@ski-blazek/db/browser'
import type { GetSnowboardInput } from '../../../../schemas/snowboard'
import {
	articleNumberOrderBy,
	articleNumberSearchFilter,
	checkedWhere,
	lastCheckedOrderBy,
	wholeNumberSearch,
} from '../../_shared/lib/equipmentListQuery'

export const listSnowboards = async ({
	page,
	itemsPerPage,
	orderBy,
	orderDirection,
	search,
	checkedFilter,
}: GetSnowboardInput) => {
	const searchWhere: Prisma.SnowboardWhereInput = search
		? {
				OR: [
					{ brand: { contains: search, mode: 'insensitive' } },
					{ model: { contains: search, mode: 'insensitive' } },
					{ length: { equals: wholeNumberSearch(search) } },
					...articleNumberSearchFilter(search),
				],
			}
		: {}

	/*  Inventura filter, AND-ed on top of the search.  */
	const where: Prisma.SnowboardWhereInput = {
		...searchWhere,
		equipmentItem: checkedWhere(checkedFilter),
	}

	const orderByClause: Prisma.SnowboardOrderByWithRelationInput[] =
		orderBy === 'articleNumber'
			? articleNumberOrderBy(orderDirection)
			: orderBy === 'lastCheckedAt'
				? lastCheckedOrderBy(orderDirection)
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
						lastCheckedAt: true,
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
