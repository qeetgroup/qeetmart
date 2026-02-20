"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { usePersonalizedProducts } from "@/hooks/usePersonalizedProducts";
import type { Product } from "@/types";

interface PersonalizedHomeSectionProps {
  fallbackProducts: Product[];
}

export function PersonalizedHomeSection({ fallbackProducts }: PersonalizedHomeSectionProps) {
  const { personalizedProducts, topCategories, hasSignals } = usePersonalizedProducts({
    limit: 10,
  });

  const products =
    hasSignals && personalizedProducts.length > 0
      ? personalizedProducts
      : fallbackProducts;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-surface-900">
            {hasSignals ? "Recommended for You" : "Starter Recommendations"}
          </h2>
          <p className="text-sm text-surface-600">
            {hasSignals
              ? `Personalized using your browsing affinity${
                  topCategories.length
                    ? ` • Top interest: ${topCategories[0].categorySlug.replace(/-/g, " ")}`
                    : ""
                }`
              : "Browse more products to unlock personalized feed ranking."}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/products?sort=personalized">View personalized catalog</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.slice(0, 10).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
