import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

export default function RootLoading() {
  return (
    <div className="container mx-auto space-y-5 px-4 py-6">
      <div className="h-10 w-2/3 animate-pulse rounded-md bg-surface-200" />
      <div className="h-48 animate-pulse rounded-xl bg-surface-200" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
