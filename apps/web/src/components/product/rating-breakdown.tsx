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
    <div className="space-y-3 rounded-xl border border-surface-200 bg-white p-4">
      <h3 className="text-sm font-semibold tracking-wide text-surface-700 uppercase">
        Rating breakdown
      </h3>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = data[rating as keyof typeof data];
        const percentage = total === 0 ? 0 : Math.round((count / total) * 100);

        return (
          <div key={rating} className="grid grid-cols-[40px,1fr,36px] items-center gap-2">
            <span className="text-sm text-surface-700">{rating}★</span>
            <Progress value={percentage} />
            <span className="text-xs text-surface-500">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
