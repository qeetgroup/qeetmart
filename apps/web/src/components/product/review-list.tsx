"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReviewsByProduct } from "@/lib/api/reviews-api";
import { queryKeys } from "@/lib/query-keys";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const { data: reviews = [] } = useQuery({
    queryKey: queryKeys.reviews(productId),
    queryFn: () => getReviewsByProduct(productId),
  });

  const topReviews = useMemo(() => reviews.slice(0, 6), [reviews]);

  if (topReviews.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-surface-300 bg-surface-50">
        <p className="text-surface-500 font-medium">No reviews yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters & Sorting */}
      <div className="flex flex-col gap-4 border-b border-surface-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-surface-600">Filter by:</span>
          {["All", "5 Star", "4 Star", "With Images"].map((filter, i) => (
            <button key={filter} className={cn("px-3 py-1.5 rounded-full text-sm font-semibold transition-colors", i === 0 ? "bg-surface-900 text-white" : "bg-surface-100 text-surface-700 hover:bg-surface-200")}>
              {filter}
            </button>
          ))}
        </div>
        <div className="text-sm font-medium text-surface-500 shrink-0">
          Showing {topReviews.length} of {reviews.length} reviews
        </div>
      </div>

      <div className="space-y-6">
        {topReviews.map((review) => (
          <article key={review.id} className="space-y-3 border-b border-surface-100 pb-6 last:border-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg bg-surface-900 px-2 py-0.5 text-xs font-bold text-white">
                    {review.rating}
                    <span className="ml-0.5 text-brand-400">★</span>
                  </div>
                  <h4 className="font-bold text-surface-900 text-lg">{review.title}</h4>
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  <span className="font-semibold text-surface-800">{review.userName}</span>
                  {review.verifiedPurchase && (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      ✓ Verified Buyer
                    </span>
                  )}
                  <span>• {formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>
            <p className="text-surface-700 leading-relaxed max-w-3xl">{review.comment}</p>
            <div className="flex items-center gap-4 pt-2">
              <button className="flex items-center gap-1.5 text-sm font-semibold text-surface-500 transition-colors hover:text-brand-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                Helpful
              </button>
              <button className="text-sm font-medium text-surface-400 hover:text-surface-700">Report</button>
            </div>
          </article>
        ))}
      </div>

      {reviews.length > 6 && (
        <div className="pt-4 text-center">
          <button className="rounded-xl border-2 border-surface-200 bg-white px-8 py-3 text-sm font-bold text-surface-800 transition-all hover:border-surface-300 hover:bg-surface-50">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}
