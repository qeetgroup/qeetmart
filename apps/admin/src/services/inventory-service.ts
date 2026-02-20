import { mockDb, withLatency } from './mock-db'
import type { InventorySummary } from './types'

export const inventoryService = {
  async getInventorySummary(tenantId?: string): Promise<InventorySummary> {
    return withLatency(() => {
      const resolvedTenantId = tenantId ?? mockDb.tenants[0]?.id
      const tenantProducts = mockDb.products.filter((product) =>
        resolvedTenantId ? product.tenantId === resolvedTenantId : true,
      )

      const items = tenantProducts.map((product) => ({
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
        tenantId: resolvedTenantId ?? 'unknown',
        totalUnits,
        lowStockCount,
        outOfStockCount,
        items: items.sort((a, b) => a.stock - b.stock),
      }
    })
  },
}
