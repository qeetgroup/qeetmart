import { Brain, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { PredictiveInsight } from '@/services'

interface PredictiveInsightCardProps {
  insight: PredictiveInsight
}

export function PredictiveInsightCard({ insight }: PredictiveInsightCardProps) {
  const isPositive = insight.impact === 'positive'

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{insight.title}</CardTitle>
            <CardDescription>{insight.metric}</CardDescription>
          </div>
          <Badge variant={isPositive ? 'default' : insight.impact === 'negative' ? 'destructive' : 'secondary'}>
            {isPositive ? <TrendingUp className="mr-1 size-3.5" /> : <TrendingDown className="mr-1 size-3.5" />}
            {insight.predictedChangePercent > 0 ? '+' : ''}
            {insight.predictedChangePercent}%
          </Badge>
        </div>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Brain className="size-3.5" /> Confidence {(insight.confidence * 100).toFixed(0)}% · {insight.horizon}
        </p>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <p>{insight.summary}</p>
        <ul className="space-y-2 text-muted-foreground">
          {insight.recommendations.map((recommendation) => (
            <li key={recommendation} className="rounded-md border border-border/70 bg-secondary/30 px-3 py-2">
              {recommendation}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
