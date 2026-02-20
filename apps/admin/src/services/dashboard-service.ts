import { mockDb, withLatency } from './mock-db'
import type { DashboardOverview } from './types'

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    return withLatency(() => {
      const totalSales = mockDb.orders.reduce((sum, order) => sum + order.total, 0)
      const totalOrders = mockDb.orders.length
      const totalCustomers = mockDb.customers.length

      return {
        totalSales,
        totalOrders,
        totalCustomers,
        salesTrend: mockDb.salesTrend,
        recentOrders: [...mockDb.orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6),
      }
    })
  },
}
