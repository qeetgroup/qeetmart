import {
  adminAccountsSeed,
  customersSeed,
  loginUsers,
  notificationsSeed,
  ordersSeed,
  predictiveInsightsSeed,
  productsSeed,
  rolesSeed,
  tenantsSeed,
} from './mock-data'

function clone<T>(value: T): T {
  return structuredClone(value)
}

export const mockDb = {
  users: clone(loginUsers),
  orders: clone(ordersSeed),
  products: clone(productsSeed),
  customers: clone(customersSeed),
  admins: clone(adminAccountsSeed),
  roles: clone(rolesSeed),
  tenants: clone(tenantsSeed),
  notifications: clone(notificationsSeed),
  insights: clone(predictiveInsightsSeed),
}

export async function withLatency<T>(callback: () => T, delay = 350): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay))
  return callback()
}
