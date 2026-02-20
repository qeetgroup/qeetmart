import { mockDb } from "@/lib/api/mock-db";
import { delay } from "@/lib/utils";
import type { RatingBreakdown } from "@/types";

export async function getReviewsByProduct(productId: string) {
  await delay(220);
  return mockDb.reviews
    .filter((review) => review.productId === productId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getRatingBreakdown(productId: string): Promise<RatingBreakdown> {
  await delay(140);

  const breakdown: RatingBreakdown = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  const reviews = mockDb.reviews.filter((review) => review.productId === productId);
  for (const review of reviews) {
    const key = review.rating as keyof RatingBreakdown;
    breakdown[key] += 1;
  }

  return breakdown;
}
