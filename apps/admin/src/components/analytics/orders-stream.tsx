import { Activity, RefreshCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { RealtimeOrderEvent } from '@/services'

interface OrdersStreamProps {
  events: RealtimeOrderEvent[]
  onClear: () => void
}

const statusVariantMap: Record<
  RealtimeOrderEvent['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  delivered: 'default',
  shipped: 'secondary',
  processing: 'outline',
  pending: 'outline',
  cancelled: 'destructive',
  refunded: 'destructive',
}

export function OrdersStream({ events, onClear }: OrdersStreamProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4 text-chart-2" /> Live Order Stream
          </CardTitle>
          <CardDescription aria-live="polite">Streaming order lifecycle events in real-time</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onClear}>
          <RefreshCcw className="mr-2 size-3.5" /> Clear
        </Button>
      </CardHeader>
      <CardContent>
        <ol className="max-h-[320px] space-y-2 overflow-auto pr-1" aria-live="polite" aria-label="Live order events">
          {events.length === 0 ? (
            <li className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              Waiting for incoming events from the mock stream.
            </li>
          ) : (
            events.map((event) => (
              <li key={event.id} className="rounded-md border border-border/70 bg-card/70 p-3 text-sm">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-medium">
                    {event.orderId} · {event.customerName}
                  </p>
                  <Badge variant={statusVariantMap[event.status]} className="capitalize">
                    {event.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.type.toUpperCase()} · {formatCurrency(event.total)} · {formatDate(event.createdAt)}
                </p>
              </li>
            ))
          )}
        </ol>
      </CardContent>
    </Card>
  )
}
