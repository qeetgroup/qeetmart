import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories } from "@/lib/api/categories-api";
import { getFeaturedProducts } from "@/lib/api/products-api";
import { getCachedHomePageData } from "@/lib/performance/cache";
import { ProductSection } from "@/components/product/product-section";
import { PersonalizedHomeSection } from "@/components/personalization/personalized-home-section";
import { RecentlyViewedSection } from "@/components/personalization/recently-viewed-section";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { PromoBanner } from "@/components/home/promo-banner";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Shop trending products with personalized recommendations, experimentation and conversion-first UX.",
};

export const revalidate = 180;

function HomeLoadingSkeleton() {
  return <div className="h-48 animate-pulse rounded-2xl bg-surface-200" />;
}

export default async function HomePage() {
  const [categories, homeData, featuredProducts] = await Promise.all([
    getCategories(),
    getCachedHomePageData(),
    getFeaturedProducts(8),
  ]);

  return (
    <div className="flex flex-col pb-16">
      <HeroSection />

      {categories.length > 0 && (
        <FeaturedCategories categories={categories} />
      )}

      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <ProductSection
            title="Featured Collection"
            subtitle="Explore our hand-picked selection of premium goods."
            products={featuredProducts}
          />
        </section>
      )}

      {homeData.trendingProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <ProductSection
            title="Trending Now"
            subtitle="Products shoppers are loving this week."
            products={homeData.trendingProducts}
            href="/products?sort=rating"
          />
        </section>
      )}

      <PromoBanner />

      <section className="container mx-auto px-4">
        <Suspense fallback={<HomeLoadingSkeleton />}>
          <PersonalizedHomeSection fallbackProducts={homeData.recommendedProducts} />
        </Suspense>
      </section>

      <section className="container mx-auto px-4">
        <Suspense fallback={<HomeLoadingSkeleton />}>
          <RecentlyViewedSection />
        </Suspense>
      </section>
    </div>
  );
}
