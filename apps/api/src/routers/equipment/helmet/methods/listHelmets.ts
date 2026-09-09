import { prisma } from '@ski-blazek/db'
import type { Prisma } from '@ski-blazek/db/browser'
import type { GetHelmetInput } from '../../../../schemas/helmet'
import {
	archivedWhere,
	articleNumberOrderBy,
	articleNumberSearchFilter,
	checkedWhere,
	lastCheckedOrderBy,
} from '../../_shared/lib/equipmentListQuery'

export const listHelmets = async ({
	page,
	itemsPerPage,
	orderBy,
	orderDirection,
	search,
	checkedFilter,
	archivedFilter,
}: GetHelmetInput) => {
	const searchWhere: Prisma.HelmetWhereInput = search
		? {
				OR: [
					{ brand: { contains: search, mode: 'insensitive' } },
					{ model: { contains: search, mode: 'insensitive' } },
					{ color: { contains: search, mode: 'insensitive' } },
					...articleNumberSearchFilter(search),
				],
			}
		: {}

	/*  Inventura filter, AND-ed on top of the search.  */
	const where: Prisma.HelmetWhereInput = {
		...searchWhere,
		equipmentItem: { ...checkedWhere(checkedFilter), ...archivedWhere(archivedFilter) },
	}

	const orderByClause: Prisma.HelmetOrderByWithRelationInput[] = [
		...(orderBy === 'articleNumber'
			? articleNumberOrderBy(orderDirection)
			: orderBy === 'lastCheckedAt'
				? lastCheckedOrderBy(orderDirection)
				: [{ [orderBy]: orderDirection }]),
		/*  Last key, always unique: without it Postgres is free to reorder rows that
		    tie on the sort column, so writing to one (ticking it off during an
		    inventura) makes it jump within its group — and across pages.  */
		{ id: 'asc' },
	]

	const [helmets, totalCount] = await prisma.$transaction([
		prisma.helmet.findMany({
			where,
			select: {
				id: true,
				brand: true,
				model: true,
				size: true,
				circumferenceMin: true,
				circumferenceMax: true,
				color: true,
				description: true,
				withIntegratedGoggles: true,
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

		prisma.helmet.count({
			where,
		}),
	])

	return {
		helmets,
		totalCount,
	}
}
