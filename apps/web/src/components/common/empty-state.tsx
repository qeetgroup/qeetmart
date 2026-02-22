import Link from "next/link";
import { SearchX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onReset?: () => void;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel = "Continue shopping",
  onReset,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-200 bg-surface-50 min-h-[400px] p-8 text-center animate-in fade-in duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-ping rounded-full bg-brand-100 opacity-70"></div>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 shadow-sm border border-brand-100">
          <SearchX className="h-10 w-10 text-brand-600" />
        </div>
      </div>

      <h3 className="mb-2 text-2xl font-bold tracking-tight text-surface-900">{title}</h3>
      <p className="mb-8 max-w-md text-base text-surface-600 leading-relaxed">{description}</p>

      <div className="flex flex-col sm:flex-row gap-3 min-w-[200px]">
        {onReset && (
          <Button
            variant="outline"
            onClick={onReset}
            className="rounded-xl h-11 border-surface-200 bg-white text-surface-700 shadow-sm hover:bg-surface-50 hover:text-surface-900 font-semibold"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
        {actionHref && (
          <Button asChild className="rounded-xl h-11 font-bold shadow-md shadow-brand-500/20">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
