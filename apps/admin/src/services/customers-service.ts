import { mockDb, withLatency } from './mock-db'
import type { Customer, CustomerFilters, CustomerSort, PaginatedResult } from './types'

function sortCustomers(customers: Customer[], sort: CustomerSort) {
  return [...customers].sort((a, b) => {
    switch (sort) {
      case 'last_order_asc':
        return a.lastOrderAt > b.lastOrderAt ? 1 : -1
      case 'name_asc':
        return a.name.localeCompare(b.name)
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'spent_desc':
        return b.totalSpent - a.totalSpent
      case 'spent_asc':
        return a.totalSpent - b.totalSpent
      case 'last_order_desc':
      default:
        return a.lastOrderAt < b.lastOrderAt ? 1 : -1
    }
  })
}

function normalizeFilters(filters: CustomerFilters | string, sortArg?: CustomerSort): CustomerFilters {
  if (typeof filters === 'string') {
    return {
      search: filters,
      sort: sortArg,
    }
  }

  return filters
}

export const customersService = {
  async getCustomers(
    filters: CustomerFilters | string = '',
    sortArg?: CustomerSort,
  ): Promise<PaginatedResult<Customer>> {
    return withLatency(() => {
      const normalized = normalizeFilters(filters, sortArg)
      const term = normalized.search?.toLowerCase().trim()
      const sort = normalized.sort ?? 'last_order_desc'
      const tenantId = normalized.tenantId ?? mockDb.tenants[0]?.id

      const filtered = sortCustomers(
        mockDb.customers
          .filter((customer) => (tenantId ? customer.tenantId === tenantId : true))
          .filter((customer) =>
            term
              ? customer.name.toLowerCase().includes(term) || customer.email.toLowerCase().includes(term)
              : true,
          ),
        sort,
      )

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
