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
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out py-12 md:py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-surface-900 md:text-4xl">
          {hasSignals ? "Recommended for You" : "Starter Recommendations"}
        </h2>
        <p className="mt-2 text-surface-600">
          {hasSignals
            ? `Personalized using your browsing affinity${topCategories.length
              ? ` • Top interest: ${topCategories[0].categorySlug.replace(/-/g, " ")}`
              : ""
            }`
            : "Browse more products to unlock personalized feed ranking."}
        </p>
        <div className="mt-6">
          <Button variant="outline" asChild className="rounded-full px-8">
            <Link href="/products?sort=personalized">View Personal Catalog</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.slice(0, 10).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section >
  );
}
