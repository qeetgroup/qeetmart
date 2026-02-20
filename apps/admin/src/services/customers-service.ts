import { mockDb, withLatency } from './mock-db'
import type { Customer, PaginatedResult } from './types'

export const customersService = {
  async getCustomers(search = ''): Promise<PaginatedResult<Customer>> {
    return withLatency(() => {
      const term = search.toLowerCase().trim()

      const filtered = mockDb.customers
        .filter((customer) =>
          term
            ? customer.name.toLowerCase().includes(term) || customer.email.toLowerCase().includes(term)
            : true,
        )
        .sort((a, b) => (a.lastOrderAt < b.lastOrderAt ? 1 : -1))

      return {
        items: filtered,
        total: filtered.length,
        page: 1,
        pageSize: filtered.length,
      }
    })
  },

  async getCustomerById(customerId: string) {
    return withLatency(() => {
      const customer = mockDb.customers.find((entry) => entry.id === customerId)
      if (!customer) {
        throw new Error('Customer not found')
      }

      return customer
    })
  },
}
