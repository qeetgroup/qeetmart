"use client";

import { useQuery } from "@tanstack/react-query";
import { getRatingBreakdown } from "@/lib/api/reviews-api";
import { queryKeys } from "@/lib/query-keys";
import { Progress } from "@/components/ui/progress";

interface RatingBreakdownProps {
  productId: string;
}

export function RatingBreakdown({ productId }: RatingBreakdownProps) {
  const { data } = useQuery({
    queryKey: queryKeys.ratingBreakdown(productId),
    queryFn: () => getRatingBreakdown(productId),
  });

  if (!data) {
    return null;
  }

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-6 rounded-3xl border border-surface-200 bg-white p-8 shadow-sm">
      <h3 className="font-bold text-surface-900 text-xl tracking-tight">
        Rating Snapshot
      </h3>
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = data[rating as keyof typeof data];
          const percentage = total === 0 ? 0 : Math.round((count / total) * 100);

          return (
            <div key={rating} className="grid grid-cols-[40px,1fr,40px] items-center gap-3">
              <span className="text-sm font-bold text-surface-700">{rating} ★</span>
              {/* @ts-ignore -- assuming Progress takes className and value */}
              <Progress value={percentage} className="h-2.5 bg-surface-100 [&>div]:bg-brand-500" />
              <span className="text-sm font-medium text-surface-500 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
