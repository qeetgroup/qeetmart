import { mockDb, withLatency } from './mock-db'
import type { InventorySummary } from './types'

export const inventoryService = {
  async getInventorySummary(): Promise<InventorySummary> {
    return withLatency(() => {
      const items = mockDb.products.map((product) => ({
        productId: product.id,
        productName: product.name,
        category: product.category,
        stock: product.stock,
        reorderThreshold: 8,
      }))

      const lowStockCount = items.filter((item) => item.stock > 0 && item.stock <= item.reorderThreshold).length
      const outOfStockCount = items.filter((item) => item.stock <= 0).length
      const totalUnits = items.reduce((sum, item) => sum + item.stock, 0)

      return {
        totalUnits,
        lowStockCount,
        outOfStockCount,
        items: items.sort((a, b) => a.stock - b.stock),
      }
    })
  },
}
