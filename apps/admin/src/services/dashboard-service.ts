import { mockDb, withLatency } from './mock-db'
import type { DashboardOverview } from './types'

function toTrend(orders: DashboardOverview['recentOrders']) {
  const dates = [...new Set(orders.map((order) => order.createdAt.slice(0, 10)))].sort()
  const latestDates = dates.slice(-12)

  return latestDates.map((date) => {
    const ordersByDate = orders.filter((order) => order.createdAt.startsWith(date))

    return {
      date,
      sales: ordersByDate.reduce((sum, order) => sum + order.total, 0),
      orders: ordersByDate.length,
    }
  })
}

export const dashboardService = {
  async getOverview(tenantId?: string): Promise<DashboardOverview> {
    return withLatency(() => {
      const resolvedTenantId = tenantId ?? mockDb.tenants[0]?.id
      const tenantOrders = mockDb.orders.filter((order) =>
        resolvedTenantId ? order.tenantId === resolvedTenantId : true,
      )

      const tenantCustomers = mockDb.customers.filter((customer) =>
        resolvedTenantId ? customer.tenantId === resolvedTenantId : true,
      )

      const totalSales = tenantOrders.reduce((sum, order) => sum + order.total, 0)
      const totalOrders = tenantOrders.length
      const totalCustomers = tenantCustomers.length
      const orderedByDate = [...tenantOrders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

      return {
        totalSales,
        totalOrders,
        totalCustomers,
        salesTrend: toTrend(orderedByDate),
        recentOrders: orderedByDate.slice(0, 6),
      }
    })
  },
}
