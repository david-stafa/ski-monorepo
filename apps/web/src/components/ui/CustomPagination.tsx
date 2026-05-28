import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@ski-blazek/ui/components/pagination'
import { cn } from '@ski-blazek/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ski-blazek/ui/components/select'

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

  return (
    <Pagination>
        <PaginationContent>
          {/* Previous page */}
          <PaginationItem>
            <PaginationPrevious asChild>
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
            </PaginationPrevious>
          </PaginationItem>

          {/* Pages */}
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink asChild isActive={currentPage === page}>
                <Link
                  to="."
                  search={(prev) => ({ ...prev, page, itemsPerPage })}
                >
                  {page}
                </Link>
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Next page */}
          <PaginationItem>
            <PaginationNext asChild>
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
            </PaginationNext>
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
      onValueChange={onValueChange}
    >
      <SelectTrigger>
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
