import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { ordersService } from '@/services'
import type { OrderFilters } from '@/services'
import { useTenantStore } from '@/stores/tenant-store'

interface UseOrdersOptions extends Omit<OrderFilters, 'tenantId'> {}

export function useOrders(options: UseOrdersOptions) {
  const tenantId = useTenantStore((state) => state.tenantId)

  return useQuery({
    queryKey: ['orders', tenantId, options],
    queryFn: () => ordersService.getOrders({ ...options, tenantId }),
  })
}

interface UseOrdersInfiniteOptions extends Omit<OrderFilters, 'page' | 'tenantId'> {
  pageSize?: number
}

export function useOrdersInfinite(options: UseOrdersInfiniteOptions) {
  const tenantId = useTenantStore((state) => state.tenantId)

  return useInfiniteQuery({
    queryKey: ['orders', 'infinite', tenantId, options],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      ordersService.getOrders({
        ...options,
        page: pageParam,
        pageSize: options.pageSize ?? 10,
        tenantId,
      }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.page * lastPage.pageSize < lastPage.total
      return hasNextPage ? lastPage.page + 1 : undefined
    },
  })
}
