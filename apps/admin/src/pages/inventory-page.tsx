import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Boxes, PackageMinus, PackageOpen } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { inventoryService } from '@/services'

export function InventoryPage() {
  const inventoryQuery = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getInventorySummary,
  })

  if (inventoryQuery.isLoading || !inventoryQuery.data) {
    return <p className="text-sm text-muted-foreground">Loading inventory metrics...</p>
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
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={inventoryQuery.data.items.slice(0, 10)} margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="productName"
                  angle={-18}
                  textAnchor="end"
                  height={72}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  interval={0}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.6rem',
                    fontSize: '0.75rem',
                  }}
                />
                <Bar dataKey="stock" fill="hsl(var(--chart-4))" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
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
              <p className="text-sm text-muted-foreground">No low stock alerts at the moment.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
