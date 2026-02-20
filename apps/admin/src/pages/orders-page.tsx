import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowDownUp, ClipboardList } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DateFilter } from '@/components/filters/date-filter'
import { SearchInput } from '@/components/filters/search-input'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { TableSkeleton } from '@/components/feedback/table-skeleton'
import { OrderDetailsDialog } from '@/components/forms/order-details-dialog'
import { DataPagination } from '@/components/layout/data-pagination'
import { PageHeader } from '@/components/layout/page-header'
import { PermissionGate } from '@/guards/permission-gate'
import { useOrders, useOrdersInfinite } from '@/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ordersService } from '@/services'
import type { Order, OrderSort, OrderStatus } from '@/services'

const statusOptions: Array<OrderStatus | 'all'> = [
  'all',
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

const orderSortOptions: Array<{ value: OrderSort; label: string }> = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'amount_desc', label: 'Amount high to low' },
  { value: 'amount_asc', label: 'Amount low to high' },
  { value: 'customer_asc', label: 'Customer A-Z' },
  { value: 'customer_desc', label: 'Customer Z-A' },
]

const defaultOrderSort: OrderSort = 'date_desc'

const statusVariantMap: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  delivered: 'default',
  shipped: 'secondary',
  processing: 'outline',
  pending: 'outline',
  cancelled: 'destructive',
  refunded: 'destructive',
}

export function OrdersPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const activeSort = useMemo<OrderSort>(() => {
    const sort = searchParams.get('sort')
    if (orderSortOptions.some((option) => option.value === sort)) {
      return sort as OrderSort
    }
    return defaultOrderSort
  }, [searchParams])

  function updateSort(nextSort: OrderSort) {
    const nextParams = new URLSearchParams(searchParams)
    if (nextSort === defaultOrderSort) {
      nextParams.delete('sort')
    } else {
      nextParams.set('sort', nextSort)
    }
    setSearchParams(nextParams, { replace: true })
  }

  const filters = useMemo(
    () => ({
      status,
      from: fromDate || undefined,
      to: toDate || undefined,
      customer: customerSearch || undefined,
      page,
      pageSize: 8,
      sort: activeSort,
    }),
    [activeSort, customerSearch, fromDate, page, status, toDate],
  )

  const ordersQuery = useOrders(filters)

  const infiniteOrdersQuery = useOrdersInfinite({
    status,
    from: fromDate || undefined,
    to: toDate || undefined,
    customer: customerSearch || undefined,
    sort: activeSort,
    pageSize: 5,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status: nextStatus }: { orderId: string; status: OrderStatus }) =>
      ordersService.updateOrderStatus(orderId, nextStatus),
    onSuccess: (_, variables) => {
      toast.success(`Order ${variables.orderId} status updated.`)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setDialogOpen(false)
    },
    onError(error: Error) {
      toast.error(error.message)
    },
  })

  const refundMutation = useMutation({
    mutationFn: ordersService.refundOrder,
    onSuccess: (order) => {
      toast.success(`Refund simulation complete for ${order.id}.`)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setDialogOpen(false)
    },
    onError(error: Error) {
      toast.error(error.message)
    },
  })

  const total = ordersQuery.data?.total ?? 0
  const infiniteOrders = infiniteOrdersQuery.data?.pages.flatMap((entry) => entry.items) ?? []

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Orders"
        description="Filter, review, and manage order lifecycle actions from a single table."
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as OrderStatus | 'all')
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      <span className="capitalize">{option}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DateFilter id="orders-from" label="From date" value={fromDate} onChange={setFromDate} />
            <DateFilter id="orders-to" label="To date" value={toDate} onChange={setToDate} />

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Customer</p>
              <SearchInput
                value={customerSearch}
                onDebouncedChange={(value) => {
                  setCustomerSearch(value)
                  setPage(1)
                }}
                placeholder="Name, email, order ID"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Sort</p>
              <Select
                value={activeSort}
                onValueChange={(value) => {
                  updateSort(value as OrderSort)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort orders" />
                </SelectTrigger>
                <SelectContent>
                  {orderSortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="inline-flex items-center gap-2">
                        <ArrowDownUp className="size-3.5" aria-hidden="true" />
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {ordersQuery.isError ? (
            <ErrorState
              title="Unable to load orders"
              description={ordersQuery.error instanceof Error ? ordersQuery.error.message : 'Orders request failed.'}
              onRetry={() => {
                void ordersQuery.refetch()
              }}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersQuery.isLoading ? (
                    <TableSkeleton columns={6} rows={8} />
                  ) : (ordersQuery.data?.items.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-4">
                        <EmptyState
                          title="No orders found"
                          description="Try adjusting filters or date range to find matching orders."
                          icon={<ClipboardList className="size-4" aria-hidden="true" />}
                          className="min-h-36"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    (ordersQuery.data?.items ?? []).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <p>{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariantMap[order.status]} className="capitalize">
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setDialogOpen(true)
                            }}
                          >
                            View details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {!ordersQuery.isLoading && (ordersQuery.data?.items.length ?? 0) > 0 ? (
                <DataPagination page={page} pageSize={8} total={total} onPageChange={setPage} />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Infinite Queue View</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {infiniteOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No queue items for current filters.</p>
          ) : (
            <ul className="space-y-2">
              {infiniteOrders.map((order) => (
                <li key={`infinite-${order.id}`} className="rounded-md border border-border/70 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{order.id}</p>
                    <Badge variant={statusVariantMap[order.status]} className="capitalize">
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.customerName} · {formatCurrency(order.total)} · {formatDate(order.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <Button
            variant="outline"
            onClick={() => {
              void infiniteOrdersQuery.fetchNextPage()
            }}
            disabled={!infiniteOrdersQuery.hasNextPage || infiniteOrdersQuery.isFetchingNextPage}
          >
            {infiniteOrdersQuery.isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </CardContent>
      </Card>

      <PermissionGate permission="orders.write">
        <OrderDetailsDialog
          order={selectedOrder}
          open={isDialogOpen}
          onOpenChange={setDialogOpen}
          onUpdateStatus={(nextStatus) => {
            if (!selectedOrder) {
              return
            }
            updateStatusMutation.mutate({ orderId: selectedOrder.id, status: nextStatus })
          }}
          onRefund={() => {
            if (!selectedOrder) {
              return
            }
            refundMutation.mutate(selectedOrder.id)
          }}
          isUpdatingStatus={updateStatusMutation.isPending}
          isRefunding={refundMutation.isPending}
        />
      </PermissionGate>
    </div>
  )
}
