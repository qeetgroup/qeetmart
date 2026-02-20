import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ProductFormDialog } from '@/components/forms/product-form-dialog'
import { DataPagination } from '@/components/layout/data-pagination'
import { PageHeader } from '@/components/layout/page-header'
import { PermissionGate } from '@/guards/permission-gate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import type { Product, ProductCategory, ProductPayload } from '@/services'

export function ProductsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filters = useMemo(
    () => ({
      page,
      pageSize: 8,
      search,
      category,
    }),
    [category, page, search],
  )

  const productsQuery = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.getProducts(filters),
  })

  const createMutation = useMutation({
    mutationFn: (payload: ProductPayload) => productsService.createProduct(payload),
    onSuccess: () => {
      toast.success('Product created successfully.')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setDialogOpen(false)
    },
    onError(error: Error) {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: ProductPayload }) =>
      productsService.updateProduct(productId, payload),
    onSuccess: () => {
      toast.success('Product updated successfully.')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Search</p>
              <Input
                value={search}
                placeholder="Search by name or SKU"
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Category</p>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value as ProductCategory | 'all')
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              {items.map((product) => (
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
                    <PermissionGate permission="products.write" fallback={<span className="text-xs text-muted-foreground">Read only</span>}>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        Edit
                      </Button>
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              ))}
              {!productsQuery.isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <DataPagination
            page={page}
            pageSize={8}
            total={productsQuery.data?.total ?? 0}
            onPageChange={setPage}
          />
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
