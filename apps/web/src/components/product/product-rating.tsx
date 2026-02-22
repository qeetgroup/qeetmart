import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductRatingProps {
  rating: number;
  reviewCount?: number;
  compact?: boolean;
}

export function ProductRating({ rating, reviewCount, compact = false }: ProductRatingProps) {
  return (
    <div className={cn("flex items-center gap-1.5", compact ? "text-xs" : "text-sm")}>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
        <Star className="h-3 w-3 fill-current" />
        {rating.toFixed(1)}
      </span>
      {typeof reviewCount === "number" ? (
        <span className="text-surface-600">({reviewCount.toLocaleString()})</span>
      ) : null}
    </div>
  );
}
