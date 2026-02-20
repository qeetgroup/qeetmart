import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface DataPaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

function getVisiblePages(current: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, current - 1, current, current + 1])
  return [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b)
}

export function DataPagination({ page, pageSize, total, onPageChange }: DataPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const visiblePages = getVisiblePages(page, totalPages)

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <p>
        Page {page} of {totalPages}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => onPageChange(page - 1)} disabled={page <= 1} />
          </PaginationItem>

          {visiblePages.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink isActive={pageNumber === page} onClick={() => onPageChange(pageNumber)}>
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
