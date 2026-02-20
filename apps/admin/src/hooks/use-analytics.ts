import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { analyticsService, realtimeService } from '@/services'
import type { RealtimeOrderEvent, SalesTrendPoint } from '@/services'
import { useTenantStore } from '@/stores/tenant-store'

function mergeTick(series: SalesTrendPoint[], date: string, sales: number, orders: number) {
  const nextSeries = [...series]
  const existingIndex = nextSeries.findIndex((entry) => entry.date === date)

  if (existingIndex >= 0) {
    const existing = nextSeries[existingIndex]
    nextSeries[existingIndex] = {
      date,
      sales: existing.sales + sales,
      orders: existing.orders + orders,
    }
  } else {
    nextSeries.push({ date, sales, orders })
  }

  return nextSeries.sort((a, b) => (a.date > b.date ? 1 : -1)).slice(-20)
}

export function useAnalytics() {
  const tenantId = useTenantStore((state) => state.tenantId)
  const queryClient = useQueryClient()
  const [liveTrend, setLiveTrend] = useState<SalesTrendPoint[]>([])
  const [orderEvents, setOrderEvents] = useState<RealtimeOrderEvent[]>([])

  const analyticsQuery = useQuery({
    queryKey: ['analytics', tenantId],
    queryFn: () => analyticsService.getSnapshot(tenantId),
  })

  useEffect(() => {
    if (analyticsQuery.data?.salesTrend) {
      setLiveTrend(analyticsQuery.data.salesTrend)
    }
  }, [analyticsQuery.data?.salesTrend])

  useEffect(() => {
    const unsubscribeTicks = realtimeService.subscribeToSalesTicks((tick) => {
      if (tick.tenantId !== tenantId) {
        return
      }

      setLiveTrend((current) => {
        const next = mergeTick(current, tick.date, tick.sales, tick.orders)

        queryClient.setQueryData(['analytics', tenantId], (cached) => {
          if (!cached || typeof cached !== 'object' || !('salesTrend' in cached)) {
            return cached
          }

          return {
            ...cached,
            salesTrend: next,
          }
        })

        return next
      })
    })

    const unsubscribeOrders = realtimeService.subscribeToOrderEvents((event) => {
      if (event.tenantId !== tenantId) {
        return
      }

      setOrderEvents((current) => [event, ...current].slice(0, 20))
    })

    return () => {
      unsubscribeTicks()
      unsubscribeOrders()
    }
  }, [queryClient, tenantId])

  return {
    ...analyticsQuery,
    data: analyticsQuery.data
      ? {
          ...analyticsQuery.data,
          salesTrend: liveTrend,
        }
      : undefined,
    orderEvents,
    clearOrderEvents: () => setOrderEvents([]),
  }
}
