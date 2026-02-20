import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

export default function ProductsLoading() {
  return (
    <div className="container mx-auto space-y-5 px-4 py-6">
      <div className="h-8 w-60 animate-pulse rounded-md bg-surface-200" />
      <ProductGridSkeleton count={12} />
    </div>
  );
}
