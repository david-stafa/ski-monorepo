import { prisma } from '@ski-blazek/db'
import type { Prisma } from '@ski-blazek/db/browser'
import type { GetSkiBootInput } from '../../../../schemas/skiBoot'
import {
	articleNumberOrderBy,
	articleNumberSearchFilter,
	bootLengthSearch,
	checkedWhere,
	lastCheckedOrderBy,
} from '../../_shared/lib/equipmentListQuery'

export const listSkiBoots = async ({
	page,
	itemsPerPage,
	orderBy,
	orderDirection,
	search,
	checkedFilter,
}: GetSkiBootInput) => {
	const searchWhere: Prisma.SkiBootWhereInput = search
		? {
				OR: [
					{ brand: { contains: search, mode: 'insensitive' } },
					{ model: { contains: search, mode: 'insensitive' } },
					{ color: { contains: search, mode: 'insensitive' } },
					{ length: { equals: bootLengthSearch(search) } },
					...articleNumberSearchFilter(search),
				],
			}
		: {}

	/*  Inventura filter, AND-ed on top of the search.  */
	const where: Prisma.SkiBootWhereInput = {
		...searchWhere,
		equipmentItem: checkedWhere(checkedFilter),
	}

	const orderByClause: Prisma.SkiBootOrderByWithRelationInput[] =
		orderBy === 'articleNumber'
			? articleNumberOrderBy(orderDirection)
			: orderBy === 'lastCheckedAt'
				? lastCheckedOrderBy(orderDirection)
				: [{ [orderBy]: orderDirection }]

	const [skiBoots, totalCount] = await prisma.$transaction([
		prisma.skiBoot.findMany({
			where,
			select: {
				id: true,
				brand: true,
				model: true,
				length: true,
				color: true,
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

		prisma.skiBoot.count({
			where,
		}),
	])

	return {
		skiBoots,
		totalCount,
	}
}
