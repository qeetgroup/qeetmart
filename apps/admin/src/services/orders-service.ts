import { isAfter, isBefore, parseISO } from 'date-fns'
import { mockDb, withLatency } from './mock-db'
import type { Order, OrderFilters, OrderStatus, PaginatedResult } from './types'

function inDateRange(order: Order, from?: string, to?: string) {
  const date = parseISO(order.createdAt)
  if (from) {
    const fromDate = parseISO(`${from}T00:00:00.000Z`)
    if (isBefore(date, fromDate)) {
      return false
    }
  }
  if (to) {
    const toDate = parseISO(`${to}T23:59:59.999Z`)
    if (isAfter(date, toDate)) {
      return false
    }
  }
  return true
}

export const ordersService = {
  async getOrders(filters: OrderFilters = {}): Promise<PaginatedResult<Order>> {
    return withLatency(() => {
      const page = filters.page ?? 1
      const pageSize = filters.pageSize ?? 8

      const filtered = mockDb.orders
        .filter((order) => (filters.status && filters.status !== 'all' ? order.status === filters.status : true))
        .filter((order) => inDateRange(order, filters.from, filters.to))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

      const start = (page - 1) * pageSize
      const items = filtered.slice(start, start + pageSize)

      return {
        items,
        total: filtered.length,
        page,
        pageSize,
      }
    })
  },

  async getOrderById(orderId: string) {
    return withLatency(() => {
      const order = mockDb.orders.find((entry) => entry.id === orderId)
      if (!order) {
        throw new Error('Order not found')
      }
      return order
    })
  },

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    return withLatency(() => {
      const order = mockDb.orders.find((entry) => entry.id === orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      order.status = status
      return order
    }, 400)
  },

  async refundOrder(orderId: string) {
    return withLatency(() => {
      const order = mockDb.orders.find((entry) => entry.id === orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      order.status = 'refunded'
      return order
    }, 450)
  },
}
