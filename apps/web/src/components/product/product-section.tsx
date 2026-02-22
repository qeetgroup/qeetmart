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
    <section className="w-full">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-surface-900 md:text-3xl">{title}</h2>
          <p className="mt-2 text-surface-600 md:text-lg">{subtitle}</p>
        </div>
        {href ? (
          <Button variant="outline" asChild className="rounded-full px-6">
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
