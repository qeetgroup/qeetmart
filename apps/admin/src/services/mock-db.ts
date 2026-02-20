import {
  adminAccountsSeed,
  customersSeed,
  loginUsers,
  ordersSeed,
  productsSeed,
  salesTrendSeed,
} from './mock-data'

function clone<T>(value: T): T {
  return structuredClone(value)
}

export const mockDb = {
  users: clone(loginUsers),
  orders: clone(ordersSeed),
  products: clone(productsSeed),
  customers: clone(customersSeed),
  salesTrend: clone(salesTrendSeed),
  admins: clone(adminAccountsSeed),
}

export async function withLatency<T>(callback: () => T, delay = 350): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay))
  return callback()
}
