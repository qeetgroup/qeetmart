import { isAfter, isBefore, parseISO } from 'date-fns'
import { mockDb, withLatency } from './mock-db'
import type { Order, OrderFilters, OrderSort, OrderStatus, PaginatedResult } from './types'

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

function sortOrders(orders: Order[], sort: OrderSort) {
  return [...orders].sort((a, b) => {
    switch (sort) {
      case 'date_asc':
        return a.createdAt > b.createdAt ? 1 : -1
      case 'amount_desc':
        return b.total - a.total
      case 'amount_asc':
        return a.total - b.total
      case 'customer_asc':
        return a.customerName.localeCompare(b.customerName)
      case 'customer_desc':
        return b.customerName.localeCompare(a.customerName)
      case 'date_desc':
      default:
        return a.createdAt < b.createdAt ? 1 : -1
    }
  })
}

export const ordersService = {
  async getOrders(filters: OrderFilters = {}): Promise<PaginatedResult<Order>> {
    return withLatency(() => {
      const page = filters.page ?? 1
      const pageSize = filters.pageSize ?? 8
      const sort = filters.sort ?? 'date_desc'
      const customer = filters.customer?.toLowerCase().trim()
      const tenantId = filters.tenantId ?? mockDb.tenants[0]?.id

      const filtered = sortOrders(
        mockDb.orders
          .filter((order) => (tenantId ? order.tenantId === tenantId : true))
          .filter((order) => (filters.status && filters.status !== 'all' ? order.status === filters.status : true))
          .filter((order) => inDateRange(order, filters.from, filters.to))
          .filter((order) => {
            if (!customer) {
              return true
            }

            return (
              order.customerName.toLowerCase().includes(customer) ||
              order.email.toLowerCase().includes(customer) ||
              order.id.toLowerCase().includes(customer)
            )
          }),
        sort,
      )

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
