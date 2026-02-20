import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories } from "@/lib/api/categories-api";
import { getFeaturedProducts } from "@/lib/api/products-api";
import { getCachedHomePageData } from "@/lib/performance/cache";
import { ProductCarousel } from "@/components/product/product-carousel";
import { ProductSection } from "@/components/product/product-section";
import { HomeHeroExperiment } from "@/components/personalization/home-hero-experiment";
import { PersonalizedHomeSection } from "@/components/personalization/personalized-home-section";
import { RecentlyViewedSection } from "@/components/personalization/recently-viewed-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Shop trending products with personalized recommendations, experimentation and conversion-first UX.",
};

export const revalidate = 180;

function HomeLoadingSkeleton() {
  return <div className="h-48 animate-pulse rounded-xl bg-surface-200" />;
}

export default async function HomePage() {
  const [categories, homeData, featuredProducts] = await Promise.all([
    getCategories(),
    getCachedHomePageData(),
    getFeaturedProducts(16),
  ]);

  return (
    <div className="space-y-8 pb-8">
      <section className="container mx-auto px-4 pt-5">
        <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
          <HomeHeroExperiment />

          <div className="grid gap-4">
            <Card className="overflow-hidden border-none bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-100">Flash Deal</p>
              <p className="mt-2 text-2xl font-black">Up to 60% OFF</p>
              <p className="mt-1 text-sm text-amber-100">Fashion and beauty picks</p>
            </Card>
            <Card className="overflow-hidden border-none bg-gradient-to-br from-emerald-500 to-cyan-500 p-5 text-white">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-100">Same Day Delivery</p>
              <p className="mt-2 text-2xl font-black">Metro Cities</p>
              <p className="mt-1 text-sm text-emerald-100">On select categories above ₹999</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto space-y-4 px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-surface-900">Top Categories</h2>
            <p className="text-sm text-surface-600">
              Amazon-style discovery with category-first shopping.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 12).map((category) => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="group overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300"
            >
              <Image
                src={category.image}
                alt={category.name}
                width={320}
                height={180}
                className="h-24 w-full object-cover"
              />
              <div className="p-3">
                <p className="text-sm font-semibold text-surface-900 group-hover:text-brand-700">
                  {category.name}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-surface-600">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto space-y-4 px-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-surface-900">Featured Products</h2>
          <p className="text-sm text-surface-600">Curated picks with premium quality and fast delivery.</p>
        </div>
        <ProductCarousel products={featuredProducts} />
      </section>

      <section className="container mx-auto px-4">
        <ProductSection
          title="Trending Now"
          subtitle="Products shoppers are buying this week"
          products={homeData.trendingProducts}
          href="/products?sort=rating"
        />
      </section>

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

      <section className="container mx-auto px-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="overflow-hidden border-none bg-gradient-to-r from-surface-900 to-surface-700 p-5 text-white">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-surface-300">Bank Offer</p>
            <p className="mt-2 text-xl font-black">10% instant discount on cards</p>
            <p className="mt-1 text-sm text-surface-300">Applicable on orders above ₹2,999.</p>
            <Button asChild variant="secondary" className="mt-3">
              <Link href="/products?sort=personalized">Unlock Deals</Link>
            </Button>
          </Card>
          <Card className="overflow-hidden border-none bg-gradient-to-r from-violet-700 to-indigo-600 p-5 text-white">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-indigo-200">Reward Program</p>
            <p className="mt-2 text-xl font-black">Earn points on every order</p>
            <p className="mt-1 text-sm text-indigo-200">Redeem points as wallet cash on next purchase.</p>
            <Button asChild variant="secondary" className="mt-3">
              <Link href="/account">See account rewards</Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
