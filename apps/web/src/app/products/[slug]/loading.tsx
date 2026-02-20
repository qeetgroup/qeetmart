export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[1fr,1fr]">
      <div className="aspect-square w-full animate-pulse rounded-xl bg-surface-200" />
      <div className="space-y-3">
        <div className="h-8 w-2/3 animate-pulse rounded bg-surface-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-surface-200" />
        <div className="h-24 w-full animate-pulse rounded bg-surface-200" />
      </div>
    </div>
  );
}
