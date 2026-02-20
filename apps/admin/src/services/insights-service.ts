import { mockDb, withLatency } from './mock-db'
import type { PredictiveInsight } from './types'

function rankInsights(insights: PredictiveInsight[]) {
  return [...insights].sort((a, b) => {
    const scoreA = Math.abs(a.predictedChangePercent) * a.confidence
    const scoreB = Math.abs(b.predictedChangePercent) * b.confidence
    return scoreB - scoreA
  })
}

export const insightsService = {
  async getInsights(tenantId?: string): Promise<PredictiveInsight[]> {
    return withLatency(() => {
      const resolvedTenantId = tenantId ?? mockDb.tenants[0]?.id
      const scoped = mockDb.insights.filter((insight) =>
        resolvedTenantId ? insight.tenantId === resolvedTenantId : true,
      )

      return rankInsights(scoped)
    }, 420)
  },
}
