import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { OrderDetailsDialog } from '@/components/forms/order-details-dialog'
import { DataPagination } from '@/components/layout/data-pagination'
import { PageHeader } from '@/components/layout/page-header'
import { PermissionGate } from '@/guards/permission-gate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import type { Order, OrderStatus } from '@/services'

const statusOptions: Array<OrderStatus | 'all'> = [
  'all',
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

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

  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const filters = useMemo(
    () => ({
      status,
      from: fromDate || undefined,
      to: toDate || undefined,
      page,
      pageSize: 8,
    }),
    [fromDate, page, status, toDate],
  )

  const ordersQuery = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersService.getOrders(filters),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status: nextStatus }: { orderId: string; status: OrderStatus }) =>
      ordersService.updateOrderStatus(orderId, nextStatus),
    onSuccess: (_, variables) => {
      toast.success(`Order ${variables.orderId} status updated.`)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
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
      setDialogOpen(false)
    },
    onError(error: Error) {
      toast.error(error.message)
    },
  })

  const total = ordersQuery.data?.total ?? 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Orders"
        description="Filter, review, and manage order lifecycle actions from a single table."
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
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

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">From date</p>
              <Input
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value)
                  setPage(1)
                }}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">To date</p>
              <Input
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value)
                  setPage(1)
                }}
              />
            </div>
          </div>

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
              {(ordersQuery.data?.items ?? []).map((order) => (
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
              ))}
              {!ordersQuery.isLoading && (ordersQuery.data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No orders found for current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <DataPagination page={page} pageSize={8} total={total} onPageChange={setPage} />
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
