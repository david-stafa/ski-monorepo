import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@ski-blazek/ui/components/pagination'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@ski-blazek/ui/components/select'
import { cn } from '@ski-blazek/ui/lib/utils'
import { Link } from '@tanstack/react-router'

/**
 * Which page buttons to show: the first page, the last page, and the current
 * page with one neighbour on each side. Anything skipped becomes a 'gap' (…).
 *
 * Page 9 of 30  →  1 … 8 9 10 … 30
 *
 * A gap that would hide just one page shows that page instead, since the
 * number takes the same space as the "…" would.
 */
function getVisiblePages(currentPage: number, totalPages: number): (number | 'gap')[] {
	const wanted = new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])
	const sorted = [...wanted].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)

	const result: (number | 'gap')[] = []
	let previous = 0
	for (const page of sorted) {
		if (page - previous === 2) result.push(previous + 1)
		if (page - previous > 2) result.push('gap')
		result.push(page)
		previous = page
	}
	return result
}

type CustomPaginationProps = {
	currentPage: number
	itemsCount: number
	itemsPerPage: number
}

export const CustomPagination = ({
	currentPage,
	itemsCount,
	itemsPerPage,
}: CustomPaginationProps) => {
	const totalPages = Math.ceil(itemsCount / itemsPerPage)
	const pages = getVisiblePages(currentPage, totalPages)

	if (itemsCount === 0) return null

	return (
		<Pagination>
			<PaginationContent>
				{/* Previous page */}
				<PaginationItem>
					<PaginationPrevious
						render={
							<Link
								to="."
								search={(prev) => ({
									...prev,
									page: currentPage - 1,
									itemsPerPage,
								})}
								disabled={currentPage === 1}
								className={cn(currentPage === 1 && 'invisible')}
							/>
						}
						text="Zpět"
					/>
				</PaginationItem>

				{/* Pages */}
				{pages.map((page, index) =>
					page === 'gap' ? (
						// A gap never moves on its own, so its position is a stable key.
						<PaginationItem key={`gap-${index}`}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={page}>
							<PaginationLink
								isActive={currentPage === page}
								render={<Link to="." search={(prev) => ({ ...prev, page, itemsPerPage })} />}
							>
								{page}
							</PaginationLink>
						</PaginationItem>
					)
				)}

				{/* Next page */}
				<PaginationItem>
					<PaginationNext
						render={
							<Link
								to="."
								search={(prev) => ({
									...prev,
									page: currentPage + 1,
									itemsPerPage,
								})}
								disabled={currentPage === totalPages}
								className={cn(currentPage === totalPages && 'invisible')}
							/>
						}
						text="Další"
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	)
}

export const CustomItemPerPageSelect = ({
	onValueChange,
	itemsPerPage,
}: {
	onValueChange: (value: string) => void
	itemsPerPage: number
}) => {
	return (
		<Select
			value={String(itemsPerPage)}
			// Base UI widens the value to `string | null`; this Select is never cleared.
			onValueChange={(value) => {
				if (value !== null) onValueChange(value)
			}}
		>
			<SelectTrigger className="ml-auto">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="10">10</SelectItem>
				<SelectItem value="25">25</SelectItem>
				<SelectItem value="50">50</SelectItem>
				<SelectItem value="100">100</SelectItem>
			</SelectContent>
		</Select>
	)
}
