import { useQuery } from '@tanstack/react-query'
import { insightsService } from '@/services'
import { useTenantStore } from '@/stores/tenant-store'

export function useInsights() {
  const tenantId = useTenantStore((state) => state.tenantId)

  return useQuery({
    queryKey: ['insights', tenantId],
    queryFn: () => insightsService.getInsights(tenantId),
  })
}
