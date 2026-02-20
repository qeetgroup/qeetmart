import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { DashboardSkeleton } from '@/components/feedback/dashboard-skeleton'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { dashboardService } from '@/services'

const SalesTrendChart = lazy(async () => {
  const module = await import('@/components/charts/sales-trend-chart')
  return { default: module.SalesTrendChart }
})

const OrdersTrendChart = lazy(async () => {
  const module = await import('@/components/charts/orders-trend-chart')
  return { default: module.OrdersTrendChart }
})

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  delivered: 'default',
  shipped: 'secondary',
  processing: 'outline',
  pending: 'outline',
  cancelled: 'destructive',
  refunded: 'destructive',
}

const easing = [0.22, 1, 0.36, 1] as const

export function DashboardPage() {
  const reduceMotion = useReducedMotion()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardService.getOverview,
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        description={error instanceof Error ? error.message : 'Dashboard data request failed.'}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!data) {
    return (
      <EmptyState
        title="No dashboard data"
        description="No KPI metrics are available for the selected time window."
        icon={<TrendingUp className="size-4" aria-hidden="true" />}
      />
    )
  }

  function reveal(delay = 0) {
    if (reduceMotion) {
      return {
        initial: false as const,
        animate: { opacity: 1 },
      }
    }

    return {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: 0.22,
        delay,
        ease: easing,
      },
    }
  }

  return (
    <div className="space-y-6" aria-label="Dashboard overview">
      <motion.div {...reveal(0)}>
        <PageHeader
          title="Performance Snapshot"
          description="Track sales velocity, order volume, and customer growth in one place."
        />
      </motion.div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <motion.div {...reveal(0.03)} whileHover={reduceMotion ? undefined : { y: -2 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Sales</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(data.totalSales)}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
              <DollarSign className="size-4 text-chart-1" /> +12.4% vs last month
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...reveal(0.06)} whileHover={reduceMotion ? undefined : { y: -2 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Orders</CardDescription>
              <CardTitle className="text-2xl">{data.totalOrders}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShoppingBag className="size-4 text-chart-2" /> +8.2% week-over-week
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...reveal(0.09)} whileHover={reduceMotion ? undefined : { y: -2 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Customers</CardDescription>
              <CardTitle className="text-2xl">{data.totalCustomers}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="size-4 text-chart-4" /> +5.6% retention uplift
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <motion.section {...reveal(0.11)} className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Revenue trend across the current period</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <SalesTrendChart data={data.salesTrend} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Over Time</CardTitle>
            <CardDescription>Order throughput over the current period</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <OrdersTrendChart data={data.salesTrend} />
            </Suspense>
          </CardContent>
        </Card>
      </motion.section>

      <motion.div {...reveal(0.14)}>
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
      </motion.div>
    </div>
  )
}
