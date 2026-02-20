import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategories } from "@/lib/api/categories-api";
import { getHomePageData } from "@/lib/api/products-api";
import { ProductCarousel } from "@/components/product/product-carousel";
import { ProductSection } from "@/components/product/product-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Home",
  description: "Shop trending products with category-first discovery and personalized recommendations.",
};

export default async function HomePage() {
  const [categories, homeData] = await Promise.all([
    getCategories(),
    getHomePageData(),
  ]);

  return (
    <div className="space-y-8 pb-8">
      <section className="container mx-auto px-4 pt-5">
        <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
          <Card className="relative overflow-hidden border-none bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-6 text-white lg:p-8">
            <div className="relative z-10 max-w-xl space-y-4">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-100">
                Mega Savings Festival
              </p>
              <h1 className="text-3xl font-black tracking-tight lg:text-5xl">
                Upgrade your daily essentials with smarter deals.
              </h1>
              <p className="text-sm text-brand-100 lg:text-base">
                Explore 100+ premium products across electronics, fashion, home, and more.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="secondary">
                  <Link href="/products">Shop now</Link>
                </Button>
                <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <Link href="/products/category/electronics">Explore electronics</Link>
                </Button>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
          </Card>

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
            <p className="text-sm text-surface-600">Amazon-style discovery with category-first shopping.</p>
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
        <ProductCarousel products={homeData.featuredProducts} />
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
        <ProductSection
          title="Recommended For You"
          subtitle="Personalized suggestions from browsing behavior"
          products={homeData.recommendedProducts}
          href="/products"
        />
      </section>

      <section className="container mx-auto px-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="overflow-hidden border-none bg-gradient-to-r from-surface-900 to-surface-700 p-5 text-white">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-surface-300">Bank Offer</p>
            <p className="mt-2 text-xl font-black">10% instant discount on cards</p>
            <p className="mt-1 text-sm text-surface-300">Applicable on orders above ₹2,999.</p>
          </Card>
          <Card className="overflow-hidden border-none bg-gradient-to-r from-violet-700 to-indigo-600 p-5 text-white">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-indigo-200">Reward Program</p>
            <p className="mt-2 text-xl font-black">Earn points on every order</p>
            <p className="mt-1 text-sm text-indigo-200">Redeem points as wallet cash on next purchase.</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
