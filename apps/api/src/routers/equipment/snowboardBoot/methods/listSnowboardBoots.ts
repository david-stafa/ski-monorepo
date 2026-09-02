import { prisma } from '@ski-blazek/db'
import type { Prisma } from '@ski-blazek/db/browser'
import type { GetSnowboardBootInput } from '../../../../schemas/snowboardBoot'
import {
	articleNumberOrderBy,
	articleNumberSearchFilter,
	bootLengthSearch,
	checkedWhere,
	lastCheckedOrderBy,
} from '../../_shared/lib/equipmentListQuery'

export const listSnowboardBoots = async ({
	page,
	itemsPerPage,
	orderBy,
	orderDirection,
	search,
	checkedFilter,
}: GetSnowboardBootInput) => {
	const searchWhere: Prisma.SnowboardBootWhereInput = search
		? {
				OR: [
					{ brand: { contains: search, mode: 'insensitive' } },
					{ model: { contains: search, mode: 'insensitive' } },
					{ length: { equals: bootLengthSearch(search) } },
					...articleNumberSearchFilter(search),
				],
			}
		: {}

	/*  Inventura filter, AND-ed on top of the search.  */
	const where: Prisma.SnowboardBootWhereInput = {
		...searchWhere,
		equipmentItem: checkedWhere(checkedFilter),
	}

	const orderByClause: Prisma.SnowboardBootOrderByWithRelationInput[] =
		orderBy === 'articleNumber'
			? articleNumberOrderBy(orderDirection)
			: orderBy === 'lastCheckedAt'
				? lastCheckedOrderBy(orderDirection)
				: [{ [orderBy]: orderDirection }]

	const [snowboardBoots, totalCount] = await prisma.$transaction([
		prisma.snowboardBoot.findMany({
			where,
			select: {
				id: true,
				brand: true,
				model: true,
				length: true,
				isBoa: true,
				isKids: true,
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

		prisma.snowboardBoot.count({
			where,
		}),
	])

	return {
		snowboardBoots,
		totalCount,
	}
}
