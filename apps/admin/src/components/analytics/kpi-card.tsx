import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { AnalyticsKpi } from '@/services'

interface KpiCardProps {
  kpi: AnalyticsKpi
}

function formatValue(kpi: AnalyticsKpi) {
  if (kpi.formatter === 'currency') {
    return formatCurrency(kpi.value)
  }

  if (kpi.formatter === 'percent') {
    return `${kpi.value.toFixed(1)}%`
  }

  return Math.round(kpi.value).toLocaleString('en-US')
}

export function KpiCard({ kpi }: KpiCardProps) {
  const trendLabel = `${kpi.trendPercent > 0 ? '+' : ''}${kpi.trendPercent.toFixed(1)}%`

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold">{formatValue(kpi)}</p>

        <p
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            kpi.direction === 'up'
              ? 'bg-emerald-500/15 text-emerald-600'
              : kpi.direction === 'down'
                ? 'bg-rose-500/15 text-rose-600'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {kpi.direction === 'up' ? (
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          ) : kpi.direction === 'down' ? (
            <ArrowDownRight className="size-3.5" aria-hidden="true" />
          ) : (
            <Minus className="size-3.5" aria-hidden="true" />
          )}
          {trendLabel}
        </p>
      </CardContent>
    </Card>
  )
}
