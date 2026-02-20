import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { productCategories } from '@/services'
import type { Product, ProductPayload } from '@/services'

const productSchema = z.object({
  name: z.string().min(3, 'Product name should be at least 3 characters.'),
  sku: z.string().min(3, 'SKU is required.'),
  category: z.enum(['Apparel', 'Footwear', 'Accessories', 'Electronics', 'Home']),
  price: z.coerce.number().positive('Price must be greater than 0.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  imageUrl: z.string().url('Provide a valid image URL.'),
})

type ProductSchema = z.infer<typeof productSchema>

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialProduct?: Product | null
  isSaving?: boolean
  onSubmit: (payload: ProductPayload) => void
}

export function ProductFormDialog({
  open,
  onOpenChange,
  initialProduct,
  onSubmit,
  isSaving,
}: ProductFormDialogProps) {
  const [selectedFileName, setSelectedFileName] = useState<string>('')

  const defaultValues = useMemo<ProductSchema>(
    () => ({
      name: initialProduct?.name ?? '',
      sku: initialProduct?.sku ?? '',
      category: initialProduct?.category ?? 'Apparel',
      price: initialProduct?.price ?? 0,
      stock: initialProduct?.stock ?? 0,
      imageUrl: initialProduct?.imageUrl ?? '',
    }),
    [initialProduct],
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    values: defaultValues,
  })

  function closeAndReset() {
    onOpenChange(false)
    setSelectedFileName('')
    reset(defaultValues)
  }

  function submit(values: ProductSchema) {
    onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? onOpenChange(value) : closeAndReset())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>
            {initialProduct
              ? 'Update product metadata, stock, and pricing.'
              : 'Create a new product listing for your catalog.'}
          </DialogDescription>
        </DialogHeader>

        <form id="product-form" className="space-y-4" onSubmit={handleSubmit(submit)}>
          <div className="space-y-2">
            <Label htmlFor="product-name">Product name</Label>
            <Input id="product-name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-sku">SKU</Label>
              <Input id="product-sku" {...register('sku')} />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value as ProductSchema['category'], { shouldValidate: true })}
              >
                <SelectTrigger id="product-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories
                    .filter((category): category is Exclude<typeof category, 'all'> => category !== 'all')
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-price">Price (USD)</Label>
              <Input id="product-price" type="number" min="1" step="1" {...register('price')} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-stock">Stock quantity</Label>
              <Input id="product-stock" type="number" min="0" step="1" {...register('stock')} />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-image">Image URL</Label>
            <Input id="product-image" placeholder="https://..." {...register('imageUrl')} />
            {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-upload">Upload image</Label>
            <label
              htmlFor="product-upload"
              className="flex cursor-pointer items-center justify-between rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
            >
              <span className="truncate">{selectedFileName || 'Choose an image file (UI simulation)'}</span>
              <Upload className="size-4" aria-hidden="true" />
            </label>
            <Input
              id="product-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  setSelectedFileName(file.name)
                }
              }}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={closeAndReset}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving
              </>
            ) : initialProduct ? (
              'Save changes'
            ) : (
              'Create product'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
