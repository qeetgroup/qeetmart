import { useQuery } from '@tanstack/react-query'
import { DollarSign, ShoppingBag, Users } from 'lucide-react'
import { SalesTrendChart } from '@/components/charts/sales-trend-chart'
import { OrdersTrendChart } from '@/components/charts/orders-trend-chart'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { dashboardService } from '@/services'

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  delivered: 'default',
  shipped: 'secondary',
  processing: 'outline',
  pending: 'outline',
  cancelled: 'destructive',
  refunded: 'destructive',
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardService.getOverview,
  })

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Performance Snapshot"
        description="Track sales velocity, order volume, and customer growth in one place."
      />

      <section className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sales</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(data.totalSales)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <DollarSign className="size-4 text-chart-1" /> +12.4% vs last month
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-2xl">{data.totalOrders}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShoppingBag className="size-4 text-chart-2" /> +8.2% week-over-week
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Customers</CardDescription>
            <CardTitle className="text-2xl">{data.totalCustomers}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-4 text-chart-4" /> +5.6% retention uplift
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Revenue trend across the current period</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesTrendChart data={data.salesTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Over Time</CardTitle>
            <CardDescription>Order throughput over the current period</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersTrendChart data={data.salesTrend} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Most recent order activity and fulfillment status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[order.status]} className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
