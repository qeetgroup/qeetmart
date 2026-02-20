import { BrainCircuit } from 'lucide-react'
import { useInsights } from '@/hooks'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { PageHeader } from '@/components/layout/page-header'
import { PredictiveInsightCard } from '@/components/insights/predictive-insight-card'

export function InsightsPage() {
  const insights = useInsights()

  if (insights.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading AI insights…</p>
  }

  if (insights.isError) {
    return (
      <ErrorState
        title="Unable to load predictive insights"
        description={insights.error instanceof Error ? insights.error.message : 'Insights request failed.'}
        onRetry={() => {
          void insights.refetch()
        }}
      />
    )
  }

  if (!insights.data || insights.data.length === 0) {
    return (
      <EmptyState
        title="No insights available"
        description="Predictive insights will appear after enough sales and order history is available."
        icon={<BrainCircuit className="size-4" aria-hidden="true" />}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="AI-Assisted Insights"
        description="Forecast growth, identify risk, and execute recommendations directly from the operations workspace."
      />

      <section className="grid gap-4 xl:grid-cols-2">
        {insights.data.map((insight) => (
          <PredictiveInsightCard key={insight.id} insight={insight} />
        ))}
      </section>
    </div>
  )
}
