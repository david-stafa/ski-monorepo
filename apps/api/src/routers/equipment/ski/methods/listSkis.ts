import { prisma } from '@ski-blazek/db'
import type { Prisma } from '@ski-blazek/db/browser'
import type { GetSkiInput } from '../../../../schemas/ski'
import {
	articleNumberOrderBy,
	articleNumberSearchFilter,
	checkedWhere,
	lastCheckedOrderBy,
	wholeNumberSearch,
} from '../../_shared/lib/equipmentListQuery'

export const listSkis = async ({
	page,
	itemsPerPage,
	orderBy,
	orderDirection,
	search,
	checkedFilter,
}: GetSkiInput) => {
	const searchWhere: Prisma.SkiWhereInput = search
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
	const where: Prisma.SkiWhereInput = {
		...searchWhere,
		equipmentItem: checkedWhere(checkedFilter),
	}

	const orderByClause: Prisma.SkiOrderByWithRelationInput[] =
		orderBy === 'articleNumber'
			? articleNumberOrderBy(orderDirection)
			: orderBy === 'lastCheckedAt'
				? lastCheckedOrderBy(orderDirection)
				: [{ [orderBy]: orderDirection }, { brand: 'asc' }]

	const [skis, totalCount] = await prisma.$transaction([
		prisma.ski.findMany({
			where,
			select: {
				id: true,
				brand: true,
				model: true,
				length: true,
				isOld: true,
				isVIP: true,
				isKids: true,
				gender: true,
				createdAt: true,
				updatedAt: true,
				equipmentItemId: true,
				equipmentItem: {
					select: {
						lastCheckedAt: true,
						articleGroup: true,
						articleNumber: true,
						retiredAt: true,
					},
				},
			},
			skip: (page - 1) * itemsPerPage,
			take: itemsPerPage,
			orderBy: orderByClause,
		}),

		prisma.ski.count({
			where,
		}),
	])

	return {
		skis,
		totalCount,
	}
}
