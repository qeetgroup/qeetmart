import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { AlertTriangle, Boxes, PackageMinus, PackageOpen } from 'lucide-react'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { TableSkeleton } from '@/components/feedback/table-skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { inventoryService } from '@/services'

const InventoryStockChart = lazy(async () => {
  const module = await import('@/components/charts/inventory-stock-chart')
  return { default: module.InventoryStockChart }
})

function InventoryPageSkeleton() {
  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`inventory-kpi-skeleton-${index}`}>
            <CardHeader className="space-y-2 pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </section>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-52" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeleton columns={2} rows={5} />
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function InventoryPage() {
  const inventoryQuery = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getInventorySummary,
  })

  if (inventoryQuery.isLoading) {
    return <InventoryPageSkeleton />
  }

  if (inventoryQuery.isError) {
    return (
      <ErrorState
        title="Unable to load inventory"
        description={
          inventoryQuery.error instanceof Error
            ? inventoryQuery.error.message
            : 'Inventory request failed.'
        }
        onRetry={() => {
          void inventoryQuery.refetch()
        }}
      />
    )
  }

  if (!inventoryQuery.data || inventoryQuery.data.items.length === 0) {
    return (
      <EmptyState
        title="No inventory records"
        description="Inventory records are not available yet."
        icon={<Boxes className="size-4" aria-hidden="true" />}
      />
    )
  }

  const lowStockItems = inventoryQuery.data.items.filter(
    (item) => item.stock > 0 && item.stock <= item.reorderThreshold,
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Inventory"
        description="Monitor stock health and trigger replenishment before shortages impact fulfillment."
      />

      <section className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Units in Stock</CardDescription>
            <CardTitle className="text-2xl">{inventoryQuery.data.totalUnits}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <Boxes className="size-4 text-chart-1" /> Across all categories
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Low Stock Alerts</CardDescription>
            <CardTitle className="text-2xl">{inventoryQuery.data.lowStockCount}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="size-4 text-chart-3" /> Requires restock planning
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Out of Stock</CardDescription>
            <CardTitle className="text-2xl">{inventoryQuery.data.outOfStockCount}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <PackageMinus className="size-4 text-destructive" /> Immediate action recommended
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Stock by Product</CardTitle>
            <CardDescription>Current quantities for lowest-stock SKUs</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
              <InventoryStockChart items={inventoryQuery.data.items} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Products close to reorder threshold</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive" className="ml-auto inline-flex">
                          <PackageOpen className="mr-1 size-3" /> {item.stock}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No low stock alerts"
                description="All tracked products are above the configured reorder threshold."
                className="min-h-32"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
