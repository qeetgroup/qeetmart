import { EmptyState } from "@/components/common/empty-state";

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <EmptyState
        title="Product not found"
        description="This product may have moved or is no longer available."
        actionHref="/products"
      />
    </div>
  );
}
