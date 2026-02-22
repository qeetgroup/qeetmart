"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductsByIds } from "@/lib/api/products-api";
import {
  getProfileUpdateEventName,
  getRecentlyViewedProductIds,
} from "@/lib/personalization/profile-engine";
import { ProductCard } from "@/components/product/product-card";

export function RecentlyViewedSection() {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() =>
    getRecentlyViewedProductIds(10),
  );

  useEffect(() => {
    const updateEvent = getProfileUpdateEventName();
    const onProfileUpdate = () => {
      setRecentlyViewedIds(getRecentlyViewedProductIds(10));
    };

    window.addEventListener(updateEvent, onProfileUpdate);

    return () => {
      window.removeEventListener(updateEvent, onProfileUpdate);
    };
  }, []);

  const { data: products = [] } = useQuery({
    queryKey: ["recently-viewed", recentlyViewedIds],
    queryFn: () => getProductsByIds(recentlyViewedIds),
    enabled: recentlyViewedIds.length > 0,
  });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-surface-200/60 py-12 md:py-16">
      <div className="mb-6 flex flex-col items-center text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-surface-900">
          Recently Viewed
        </h2>
        <p className="mt-1 text-sm text-surface-500">Pick up exactly where you left off.</p>
      </div>

      {/* Horizontal scroll container on mobile, grid on larger screens */}
      <div className="flex -mx-4 overflow-x-auto snap-x snap-mandatory px-4 pb-8 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none sm:px-0 sm:pb-0 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <div key={product.id} className="min-w-[240px] max-w-[280px] shrink-0 snap-start sm:min-w-0 sm:max-w-none">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
