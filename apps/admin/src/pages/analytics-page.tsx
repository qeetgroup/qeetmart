import { BarChart3 } from 'lucide-react'
import { useAnalytics, useInsights } from '@/hooks'
import { KpiCard } from '@/components/analytics/kpi-card'
import { OrdersStream } from '@/components/analytics/orders-stream'
import { SalesChart } from '@/components/analytics/sales-chart'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { PageHeader } from '@/components/layout/page-header'
import { PredictiveInsightCard } from '@/components/insights/predictive-insight-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AnalyticsPage() {
  const analytics = useAnalytics()
  const insights = useInsights()

  if (analytics.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading analytics…</p>
  }

  if (analytics.isError) {
    return (
      <ErrorState
        title="Unable to load analytics"
        description={analytics.error instanceof Error ? analytics.error.message : 'Analytics request failed.'}
        onRetry={() => {
          void analytics.refetch()
        }}
      />
    )
  }

  if (!analytics.data) {
    return (
      <EmptyState
        title="No analytics available"
        description="There is no analytics data for the selected store yet."
        icon={<BarChart3 className="size-4" aria-hidden="true" />}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Real-Time Analytics"
        description="Track KPI performance, live sales trends, and streaming order events per store."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analytics.data.kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Live Sales Trend</CardTitle>
            <CardDescription>Sales and order volume update in real-time from mock event stream</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={analytics.data.salesTrend} />
          </CardContent>
        </Card>

        {insights.data && insights.data.length > 0 ? (
          <PredictiveInsightCard insight={insights.data[0]} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>AI Insight</CardTitle>
              <CardDescription>Prediction model is warming up.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Insight generation will appear here once trend thresholds are reached.
            </CardContent>
          </Card>
        )}
      </section>

      <OrdersStream events={analytics.orderEvents} onClear={analytics.clearOrderEvents} />
    </div>
  )
}
