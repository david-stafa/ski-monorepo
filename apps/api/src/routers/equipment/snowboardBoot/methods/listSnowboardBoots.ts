import { prisma } from '@ski-blazek/db'
import type { Prisma } from '@ski-blazek/db/browser'
import type { GetSnowboardBootInput } from '../../../../schemas/snowboardBoot'
import {
	articleNumberOrderBy,
	articleNumberSearchFilter,
	wholeNumberSearch,
} from '../../_shared/lib/equipmentListQuery'

export const listSnowboardBoots = async ({
	page,
	itemsPerPage,
	orderBy,
	orderDirection,
	search,
}: GetSnowboardBootInput) => {
	const where: Prisma.SnowboardBootWhereInput = search
		? {
				OR: [
					{ brand: { contains: search, mode: 'insensitive' } },
					{ model: { contains: search, mode: 'insensitive' } },
					{ length: { equals: wholeNumberSearch(search) } },
					...articleNumberSearchFilter(search),
				],
			}
		: {}

	const orderByClause: Prisma.SnowboardBootOrderByWithRelationInput[] =
		orderBy === 'articleNumber'
			? articleNumberOrderBy(orderDirection)
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

		prisma.snowboardBoot.count({
			where,
		}),
	])

	return {
		snowboardBoots,
		totalCount,
	}
}
