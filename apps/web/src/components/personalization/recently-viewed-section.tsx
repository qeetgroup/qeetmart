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
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-surface-900">
          Recently Viewed
        </h2>
        <p className="text-sm text-surface-600">Pick up where you left off.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
