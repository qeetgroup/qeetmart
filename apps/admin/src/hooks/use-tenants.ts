import { useQuery } from '@tanstack/react-query'
import { tenantsService } from '@/services'

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: tenantsService.getTenants,
    staleTime: 1000 * 60 * 5,
  })
}
