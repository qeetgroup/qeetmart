import { mockDb, withLatency } from './mock-db'
import type {
  PaginatedResult,
  Product,
  ProductCategory,
  ProductFilters,
  ProductPayload,
  ProductSort,
} from './types'

export const productCategories: Array<ProductCategory | 'all'> = [
  'all',
  'Apparel',
  'Footwear',
  'Accessories',
  'Electronics',
  'Home',
]

function sortProducts(products: Product[], sort: ProductSort) {
  return [...products].sort((a, b) => {
    switch (sort) {
      case 'updated_asc':
        return a.updatedAt > b.updatedAt ? 1 : -1
      case 'name_asc':
        return a.name.localeCompare(b.name)
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'price_desc':
        return b.price - a.price
      case 'price_asc':
        return a.price - b.price
      case 'updated_desc':
      default:
        return a.updatedAt < b.updatedAt ? 1 : -1
    }
  })
}

function resolveCategories(filters: ProductFilters) {
  if (filters.categories && filters.categories.length > 0) {
    return filters.categories
  }

  if (filters.category && filters.category !== 'all') {
    return [filters.category]
  }

  return []
}

export const productsService = {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
    return withLatency(() => {
      const page = filters.page ?? 1
      const pageSize = filters.pageSize ?? 8
      const search = filters.search?.toLowerCase().trim()
      const sort = filters.sort ?? 'updated_desc'
      const categories = resolveCategories(filters)
      const tenantId = filters.tenantId ?? mockDb.tenants[0]?.id

      const filtered = sortProducts(
        mockDb.products
          .filter((product) => (tenantId ? product.tenantId === tenantId : true))
          .filter((product) =>
            search
              ? product.name.toLowerCase().includes(search) || product.sku.toLowerCase().includes(search)
              : true,
          )
          .filter((product) => (categories.length > 0 ? categories.includes(product.category) : true))
          .filter((product) => (typeof filters.priceMin === 'number' ? product.price >= filters.priceMin : true))
          .filter((product) => (typeof filters.priceMax === 'number' ? product.price <= filters.priceMax : true)),
        sort,
      )

      const start = (page - 1) * pageSize

      return {
        items: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
      }
    })
  },

  async createProduct(payload: ProductPayload) {
    return withLatency(() => {
      const tenantId = payload.tenantId ?? mockDb.tenants[0]?.id
      if (!tenantId) {
        throw new Error('Store location is required.')
      }

      const newProduct: Product = {
        id: `p-${mockDb.products.length + 1}`,
        ...payload,
        tenantId,
        updatedAt: new Date().toISOString(),
      }
      mockDb.products.unshift(newProduct)
      return newProduct
    }, 500)
  },

  async updateProduct(productId: string, payload: ProductPayload) {
    return withLatency(() => {
      const product = mockDb.products.find((entry) => entry.id === productId)
      if (!product) {
        throw new Error('Product not found')
      }

      Object.assign(product, payload, {
        tenantId: payload.tenantId ?? product.tenantId,
        updatedAt: new Date().toISOString(),
      })
      return product
    }, 500)
  },
}
