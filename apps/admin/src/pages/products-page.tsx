import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowDownUp, PackageSearch, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { SearchInput } from '@/components/filters/search-input'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { TableSkeleton } from '@/components/feedback/table-skeleton'
import { ProductFormDialog } from '@/components/forms/product-form-dialog'
import { DataPagination } from '@/components/layout/data-pagination'
import { PageHeader } from '@/components/layout/page-header'
import { PermissionGate } from '@/guards/permission-gate'
import { useProducts } from '@/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { productCategories, productsService } from '@/services'
import type { Product, ProductCategory, ProductPayload, ProductSort } from '@/services'
import { useTenantStore } from '@/stores/tenant-store'

const availableCategories = productCategories.filter((category) => category !== 'all') as ProductCategory[]

const productSortOptions: Array<{ value: ProductSort; label: string }> = [
  { value: 'updated_desc', label: 'Recently updated' },
  { value: 'updated_asc', label: 'Oldest updated' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'price_desc', label: 'Price high to low' },
  { value: 'price_asc', label: 'Price low to high' },
]

const defaultProductSort: ProductSort = 'updated_desc'

export function ProductsPage() {
  const queryClient = useQueryClient()
  const tenantId = useTenantStore((state) => state.tenantId)
  const [searchParams, setSearchParams] = useSearchParams()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const activeSort = useMemo<ProductSort>(() => {
    const sort = searchParams.get('sort')
    if (productSortOptions.some((option) => option.value === sort)) {
      return sort as ProductSort
    }
    return defaultProductSort
  }, [searchParams])

  function updateSort(nextSort: ProductSort) {
    const nextParams = new URLSearchParams(searchParams)
    if (nextSort === defaultProductSort) {
      nextParams.delete('sort')
    } else {
      nextParams.set('sort', nextSort)
    }
    setSearchParams(nextParams, { replace: true })
  }

  const filters = useMemo(
    () => ({
      page,
      pageSize: 8,
      search,
      categories,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      sort: activeSort,
    }),
    [activeSort, categories, page, priceMax, priceMin, search],
  )

  const productsQuery = useProducts(filters)

  const createMutation = useMutation({
    mutationFn: (payload: ProductPayload) => productsService.createProduct({ ...payload, tenantId }),
    onSuccess: () => {
      toast.success('Product created successfully.')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setDialogOpen(false)
    },
    onError(error: Error) {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: ProductPayload }) =>
      productsService.updateProduct(productId, { ...payload, tenantId }),
    onSuccess: () => {
      toast.success('Product updated successfully.')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setDialogOpen(false)
      setEditingProduct(null)
    },
    onError(error: Error) {
      toast.error(error.message)
    },
  })

  function handleOpenCreate() {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  function toggleCategory(category: ProductCategory, checked: boolean) {
    setCategories((current) => {
      if (checked) {
        return [...new Set([...current, category])]
      }
      return current.filter((entry) => entry !== category)
    })
    setPage(1)
  }

  const items = productsQuery.data?.items ?? []

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Products"
        description="Maintain catalog data, pricing, stock levels, and product media."
        actions={
          <PermissionGate permission="products.write">
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 size-4" /> Add product
            </Button>
          </PermissionGate>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 xl:grid-cols-[1fr_220px_120px_120px_220px]">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Search</p>
              <SearchInput
                value={search}
                placeholder="Search by name or SKU"
                onDebouncedChange={(value) => {
                  setSearch(value)
                  setPage(1)
                }}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Categories</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {categories.length > 0 ? `${categories.length} selected` : 'All categories'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {availableCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={categories.includes(category)}
                      onCheckedChange={(checked) => toggleCategory(category, Boolean(checked))}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Min price</p>
              <Input
                type="number"
                min={0}
                value={priceMin}
                onChange={(event) => {
                  setPriceMin(event.target.value)
                  setPage(1)
                }}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Max price</p>
              <Input
                type="number"
                min={0}
                value={priceMax}
                onChange={(event) => {
                  setPriceMax(event.target.value)
                  setPage(1)
                }}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Sort</p>
              <Select
                value={activeSort}
                onValueChange={(value) => {
                  updateSort(value as ProductSort)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort products" />
                </SelectTrigger>
                <SelectContent>
                  {productSortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="inline-flex items-center gap-2">
                        <ArrowDownUp className="size-3.5" aria-hidden="true" />
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {productsQuery.isError ? (
            <ErrorState
              title="Unable to load products"
              description={
                productsQuery.error instanceof Error ? productsQuery.error.message : 'Products request failed.'
              }
              onRetry={() => {
                void productsQuery.refetch()
              }}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsQuery.isLoading ? (
                    <TableSkeleton columns={6} rows={8} />
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-4">
                        <EmptyState
                          title="No products found"
                          description="Try adjusting search keywords, categories, or price filters."
                          icon={<PackageSearch className="size-4" aria-hidden="true" />}
                          className="min-h-36"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="size-10 rounded-md border border-border/70 object-cover"
                              loading="lazy"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.sku}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock <= 8 ? 'destructive' : 'secondary'}>
                            {product.stock <= 0 ? 'Out of stock' : `${product.stock} units`}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(product.updatedAt)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                        <TableCell className="text-right">
                          <PermissionGate
                            permission="products.write"
                            fallback={<span className="text-xs text-muted-foreground">Read only</span>}
                          >
                            <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                              Edit
                            </Button>
                          </PermissionGate>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {!productsQuery.isLoading && items.length > 0 ? (
                <DataPagination
                  page={page}
                  pageSize={8}
                  total={productsQuery.data?.total ?? 0}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        initialProduct={editingProduct}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onSubmit={(payload) => {
          if (editingProduct) {
            updateMutation.mutate({ productId: editingProduct.id, payload })
            return
          }
          createMutation.mutate(payload)
        }}
      />
    </div>
  )
}
