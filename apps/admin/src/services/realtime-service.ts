import { mockDb } from './mock-db'
import type { RealtimeOrderEvent, RealtimeSalesTick } from './types'

type Listener<T> = (payload: T) => void

const eventTypes: RealtimeOrderEvent['type'][] = ['created', 'updated', 'refunded']
const orderStatuses: RealtimeOrderEvent['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'refunded']

class MockRealtimeClient {
  private orderListeners = new Set<Listener<RealtimeOrderEvent>>()
  private tickListeners = new Set<Listener<RealtimeSalesTick>>()
  private timerId?: ReturnType<typeof setInterval>

  connect() {
    if (this.timerId) {
      return
    }

    this.timerId = setInterval(() => {
      this.emitSalesTick()
      if (Math.random() > 0.35) {
        this.emitOrderEvent()
      }
    }, 2500)
  }

  disconnect() {
    if (!this.timerId) {
      return
    }

    clearInterval(this.timerId)
    this.timerId = undefined
  }

  subscribeToOrderEvents(listener: Listener<RealtimeOrderEvent>) {
    this.orderListeners.add(listener)
    this.connect()

    return () => {
      this.orderListeners.delete(listener)
      this.cleanupIfIdle()
    }
  }

  subscribeToSalesTicks(listener: Listener<RealtimeSalesTick>) {
    this.tickListeners.add(listener)
    this.connect()

    return () => {
      this.tickListeners.delete(listener)
      this.cleanupIfIdle()
    }
  }

  private cleanupIfIdle() {
    if (this.orderListeners.size === 0 && this.tickListeners.size === 0) {
      this.disconnect()
    }
  }

  private emitOrderEvent() {
    const randomOrder = mockDb.orders[Math.floor(Math.random() * mockDb.orders.length)]
    if (!randomOrder) {
      return
    }

    const nextStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
    const nextType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    randomOrder.status = nextStatus

    const event: RealtimeOrderEvent = {
      id: `evt-order-${Date.now()}`,
      tenantId: randomOrder.tenantId,
      orderId: randomOrder.id,
      type: nextType,
      customerName: randomOrder.customerName,
      status: randomOrder.status,
      total: randomOrder.total,
      createdAt: new Date().toISOString(),
    }

    for (const listener of this.orderListeners) {
      listener(event)
    }
  }

  private emitSalesTick() {
    const tenant = mockDb.tenants[Math.floor(Math.random() * mockDb.tenants.length)]
    if (!tenant) {
      return
    }

    const tick: RealtimeSalesTick = {
      id: `evt-sales-${Date.now()}`,
      tenantId: tenant.id,
      date: new Date().toISOString().slice(0, 10),
      sales: 100 + Math.round(Math.random() * 1200),
      orders: 1 + Math.round(Math.random() * 8),
    }

    for (const listener of this.tickListeners) {
      listener(tick)
    }
  }
}

export const realtimeService = new MockRealtimeClient()
