import { mockDb, withLatency } from './mock-db'
import type {
  PaginatedResult,
  Product,
  ProductCategory,
  ProductFilters,
  ProductPayload,
} from './types'

export const productCategories: Array<ProductCategory | 'all'> = [
  'all',
  'Apparel',
  'Footwear',
  'Accessories',
  'Electronics',
  'Home',
]

export const productsService = {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
    return withLatency(() => {
      const page = filters.page ?? 1
      const pageSize = filters.pageSize ?? 8
      const search = filters.search?.toLowerCase().trim()

      const filtered = mockDb.products
        .filter((product) =>
          search
            ? product.name.toLowerCase().includes(search) || product.sku.toLowerCase().includes(search)
            : true,
        )
        .filter((product) =>
          filters.category && filters.category !== 'all' ? product.category === filters.category : true,
        )
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

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
      const newProduct: Product = {
        id: `p-${mockDb.products.length + 1}`,
        ...payload,
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

      Object.assign(product, payload, { updatedAt: new Date().toISOString() })
      return product
    }, 500)
  },
}
