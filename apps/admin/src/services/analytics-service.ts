import { mockDb, withLatency } from './mock-db'
import type { AnalyticsKpi, AnalyticsSnapshot, Order, SalesTrendPoint } from './types'

function percentDelta(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }

  return ((current - previous) / previous) * 100
}

function trendDirection(value: number): AnalyticsKpi['direction'] {
  if (value > 0.1) {
    return 'up'
  }

  if (value < -0.1) {
    return 'down'
  }

  return 'flat'
}

function buildSalesTrend(orders: Order[]): SalesTrendPoint[] {
  const grouped = orders.reduce<Record<string, { sales: number; orders: number }>>((acc, order) => {
    const date = order.createdAt.slice(0, 10)
    if (!acc[date]) {
      acc[date] = {
        sales: 0,
        orders: 0,
      }
    }
    acc[date].sales += order.total
    acc[date].orders += 1
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([date, value]) => ({ date, sales: value.sales, orders: value.orders }))
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(-14)
}

function sumSales(entries: Order[]) {
  return entries.reduce((sum, entry) => sum + entry.total, 0)
}

function buildKpis(orders: Order[], customersCount: number): AnalyticsKpi[] {
  const sorted = [...orders].sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
  const recentWindow = sorted.slice(-14)
  const previousWindow = sorted.slice(Math.max(0, sorted.length - 28), Math.max(0, sorted.length - 14))

  const recentSales = sumSales(recentWindow)
  const previousSales = sumSales(previousWindow)
  const recentOrders = recentWindow.length
  const previousOrders = previousWindow.length

  const recentAov = recentOrders > 0 ? recentSales / recentOrders : 0
  const previousAov = previousOrders > 0 ? previousSales / previousOrders : 0

  const recentConversion = customersCount > 0 ? Math.min(12, (recentOrders / customersCount) * 100) : 0
  const previousConversion = customersCount > 0 ? Math.min(12, (previousOrders / customersCount) * 100) : 0

  const salesTrend = percentDelta(recentSales, previousSales)
  const ordersTrend = percentDelta(recentOrders, previousOrders)
  const aovTrend = percentDelta(recentAov, previousAov)
  const conversionTrend = percentDelta(recentConversion, previousConversion)

  return [
    {
      id: 'sales',
      label: 'Sales',
      value: recentSales,
      trendPercent: salesTrend,
      direction: trendDirection(salesTrend),
      formatter: 'currency',
    },
    {
      id: 'orders',
      label: 'Orders',
      value: recentOrders,
      trendPercent: ordersTrend,
      direction: trendDirection(ordersTrend),
      formatter: 'number',
    },
    {
      id: 'avg_order_value',
      label: 'Average Order Value',
      value: recentAov,
      trendPercent: aovTrend,
      direction: trendDirection(aovTrend),
      formatter: 'currency',
    },
    {
      id: 'conversion',
      label: 'Conversion Rate',
      value: recentConversion,
      trendPercent: conversionTrend,
      direction: trendDirection(conversionTrend),
      formatter: 'percent',
    },
  ]
}

export const analyticsService = {
  async getSnapshot(tenantId?: string): Promise<AnalyticsSnapshot> {
    return withLatency(() => {
      const resolvedTenantId = tenantId ?? mockDb.tenants[0]?.id

      const tenantOrders = mockDb.orders.filter((order) =>
        resolvedTenantId ? order.tenantId === resolvedTenantId : true,
      )

      const tenantCustomers = mockDb.customers.filter((customer) =>
        resolvedTenantId ? customer.tenantId === resolvedTenantId : true,
      )

      const salesTrend = buildSalesTrend(tenantOrders)
      const recentOrders = [...tenantOrders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 8)

      return {
        tenantId: resolvedTenantId ?? 'unknown',
        kpis: buildKpis(tenantOrders, tenantCustomers.length),
        salesTrend,
        recentOrders,
      }
    })
  },
}
