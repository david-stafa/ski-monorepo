import {
	Pagination,
	PaginationContent,
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
	const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

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
					/>
				</PaginationItem>

				{/* Pages */}
				{pages.map((page) => (
					<PaginationItem key={page}>
						<PaginationLink
							isActive={currentPage === page}
							render={<Link to="." search={(prev) => ({ ...prev, page, itemsPerPage })} />}
						>
							{page}
						</PaginationLink>
					</PaginationItem>
				))}

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
