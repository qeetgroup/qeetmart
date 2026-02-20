import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { productsService } from '@/services'
import type { ProductFilters } from '@/services'
import { useTenantStore } from '@/stores/tenant-store'

interface UseProductsOptions extends Omit<ProductFilters, 'tenantId'> {}

export function useProducts(options: UseProductsOptions) {
  const tenantId = useTenantStore((state) => state.tenantId)

  return useQuery({
    queryKey: ['products', tenantId, options],
    queryFn: () => productsService.getProducts({ ...options, tenantId }),
  })
}

interface UseProductsInfiniteOptions extends Omit<ProductFilters, 'page' | 'tenantId'> {
  pageSize?: number
}

export function useProductsInfinite(options: UseProductsInfiniteOptions) {
  const tenantId = useTenantStore((state) => state.tenantId)

  return useInfiniteQuery({
    queryKey: ['products', 'infinite', tenantId, options],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      productsService.getProducts({
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
