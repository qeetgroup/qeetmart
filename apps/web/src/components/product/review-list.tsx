"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReviewsByProduct } from "@/lib/api/reviews-api";
import { queryKeys } from "@/lib/query-keys";
import { formatDate } from "@/lib/utils";
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

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-black tracking-tight text-surface-900">Customer Reviews</h3>
      {topReviews.length === 0 ? (
        <p className="text-sm text-surface-600">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {topReviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-surface-200 bg-white p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="success">{review.rating}★</Badge>
                <p className="text-sm font-semibold text-surface-900">{review.title}</p>
                {review.verifiedPurchase ? (
                  <Badge variant="secondary">Verified Purchase</Badge>
                ) : null}
              </div>
              <p className="text-sm text-surface-700">{review.comment}</p>
              <div className="mt-2 text-xs text-surface-500">
                By {review.userName} • {formatDate(review.createdAt)}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
