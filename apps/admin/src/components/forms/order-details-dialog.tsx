import { Loader2, ReceiptText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order, OrderStatus } from '@/services'

const orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

interface OrderDetailsDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateStatus: (status: OrderStatus) => void
  onRefund: () => void
  isUpdatingStatus?: boolean
  isRefunding?: boolean
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onUpdateStatus,
  onRefund,
  isUpdatingStatus,
  isRefunding,
}: OrderDetailsDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending')

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status)
    }
  }, [order])

  if (!order) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ReceiptText className="size-4" /> {order.id}
          </DialogTitle>
          <DialogDescription>
            Placed on {formatDate(order.createdAt)} by {order.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-secondary/30 p-3 text-sm">
            <p className="font-medium">Shipping address</p>
            <p className="text-muted-foreground">{order.shippingAddress}</p>
            <p className="mt-1 text-muted-foreground">Contact: {order.email}</p>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Line items</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p>{formatCurrency(item.unitPrice * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-status">Order status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
              <SelectTrigger id="order-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className="capitalize">{status}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 text-sm font-semibold">
            <span>Order total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" variant="destructive" onClick={onRefund} disabled={isRefunding || order.status === 'refunded'}>
            {isRefunding ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Processing
              </>
            ) : (
              'Refund simulation'
            )}
          </Button>
          <Button
            type="button"
            disabled={isUpdatingStatus || selectedStatus === order.status}
            onClick={() => onUpdateStatus(selectedStatus)}
          >
            {isUpdatingStatus ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Updating
              </>
            ) : (
              'Save status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
