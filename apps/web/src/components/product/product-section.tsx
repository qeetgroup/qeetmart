import Link from "next/link";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  href?: string;
}

export function ProductSection({ title, subtitle, products, href }: ProductSectionProps) {
  if (!products?.length) return null;

  return (
    <section className="w-full py-8 md:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-surface-900 md:text-4xl">{title}</h2>
          <p className="text-surface-600 font-medium md:text-lg">{subtitle}</p>
        </div>
        {href ? (
          <Button variant="outline" asChild className="rounded-full px-8 h-12 font-bold text-surface-800">
            <Link href={href}>View Collection</Link>
          </Button>
        ) : null}
      </div>

      <div className="flex -mx-4 overflow-x-auto snap-x snap-mandatory px-4 pb-8 sm:mx-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:snap-none sm:px-0 sm:pb-0 gap-4 md:gap-6">
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] shrink-0 snap-start sm:min-w-0 sm:max-w-none">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
