import { EmptyState } from "@/components/common/empty-state";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist."
        actionHref="/"
        actionLabel="Back to Home"
      />
    </div>
  );
}
